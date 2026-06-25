// Heatwave forecast — modified mean-reverting jump-diffusion for Berlin daily Tmax,
// projected July / August / September 2026. Writes a per-path daily dataset to CSV
// (data/forecast_daily.csv) for loading into DuckDB (see forecast/load_duckdb.py).
//
// Model (daily Euler step, dt = 1 day):
//   dT = [ Sdot + kappa*(S(t)+A(t) - T) ] dt + sigma(t) dW + J_up dN_up - J_dn dN_dn
//   S(t)        : seasonal climatological Tmax (1991-2020 normal, Berlin)
//   A(t)        : climate offset = structural warming + decaying heat-dome anomaly
//   kappa       : mean-reversion speed (slower when the jet is "blocked")
//   sigma(t)    : season-dependent diffusion vol
//   J_up        : Generalized-Pareto (GPD) up-jumps = heat ridges  [PARETO TAIL]
//   J_dn        : exponential down-jumps = cold-front passages
//
// Two coupled state drivers:
//   jet  in {zonal, blocked} : 2-state Markov regime (omega-block). Blocking slows
//                              mean-reversion, boosts heat-jump rate/size, suppresses
//                              cold fronts, and accelerates soil drying.
//   D    in [0,1]            : soil-moisture deficit (drought). Rises on hot days,
//                              recharges on cold-front rain; raises the up-jump rate.
//   => physical triad jet -> drought -> heat (self-reinforcing heat persistence).
//
// Why GPD up-jumps: by extreme-value theory (peaks-over-threshold), exceedances over
// a high threshold are Generalized-Pareto distributed. The previous exponential tail
// produced unphysical ~50 C spikes; GPD with a physical cap is the principled fix.

const fs = require('fs');
const path = require('path');

const N_PATHS = 10000;      // Monte-Carlo paths (all persisted, so SQL == printed report)
const SEED = 42;
const OUT_CSV = path.join(__dirname, '..', 'data', 'forecast_daily.csv');

// ---- seeded RNG (mulberry32) + helpers ----
let s = SEED >>> 0;
function rand() { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
function randn() { let u = 0, v = 0; while (u === 0) u = rand(); while (v === 0) v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function expo(mean) { return -mean * Math.log(1 - rand()); }
// Generalized Pareto: inverse-CDF sampling. xi>0 => heavy (but capped) upper tail.
function gpd(xi, beta) { return (beta / xi) * (Math.pow(1 - rand(), -xi) - 1); }

// ---- calendar ----
function doy(y, m, d) { return Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86400000); }
function isoDate(d) { return new Date(Date.UTC(2026, 0, 0) + d * 86400000).toISOString().slice(0, 10); }
function monthOf(d) { return new Date(Date.UTC(2026, 0, 0) + d * 86400000).getUTCMonth() + 1; }
const START = doy(2026, 6, 26);    // forecast start: 26 Jun 2026
const END   = doy(2026, 9, 30);    // 30 Sep 2026
const DAYS  = END - START + 1;

// ---- seasonal climatology (Berlin daily Tmax, 1991-2020 normal) ----
const S_MEAN = 14.0, S_AMP = 11.0, S_PEAK = 205; // peak ~ 24 Jul
const W = 2 * Math.PI / 365.25;
function S(d)    { return S_MEAN + S_AMP * Math.cos(W * (d - S_PEAK)); }
function Sdot(d) { return -S_AMP * W * Math.sin(W * (d - S_PEAK)); }

// ---- climate offset A(t) = structural warming + decaying heat-dome anomaly ----
const STRUCT_WARM = 1.6;   // 2026 vs 1991-2020 baseline, deg C
const DOME0       = 2.6;   // current active heat-dome anomaly on top, deg C
const DOME_TAU    = 11;    // e-folding decay (days) of the transient ridge
function A(i) { return STRUCT_WARM + DOME0 * Math.exp(-i / DOME_TAU); }

// ---- base dynamics ----
const KAPPA    = 0.26;                 // mean reversion / day (zonal regime)
const SIG_BASE = 2.2, SIG_SUM = 0.6;   // vol higher near midsummer
function sigma(d) { return SIG_BASE + SIG_SUM * Math.max(0, Math.cos(W * (d - S_PEAK))); }

// ---- jumps (asymmetric) ----
const LAM_BASE = 0.018;   // base up-jump intensity / day
const LAM_DRO  = 0.045;   // extra up-jump intensity per unit drought deficit D
const GPD_XI   = 0.15;    // GPD shape (tail heaviness; <0.5 keeps finite variance)
const GPD_BETA = 1.8;     // GPD scale, deg C
const JUMP_CAP = 7.0;     // physical cap on a single up-jump, deg C (bounds the tail)
const LAM_DOWN = 0.045;   // down-jump intensity / day (cold-front passage)
const JDN_MEAN = 3.2;     // mean down-jump size, deg C

// ---- jet-stream Markov regime {zonal, blocked} ----
// Calibrated: mean blocked episode ~10 days; ~30% blocked days in high summer.
const P_BLOCK_BASE = 0.035; // P(zonal -> blocked) / day
const P_UNBLOCK    = 0.100; // P(blocked -> zonal) / day  => mean length 10 d
function pBlock(d) { // mildly seasonal: blocking more likely near midsummer
  return P_BLOCK_BASE * (1 + 0.4 * Math.max(0, Math.cos(W * (d - S_PEAK))));
}
// blocked-regime modifiers (persistence + tail, WITHOUT inflating the mean much)
const K_BLOCK   = 0.21;  // slower mean reversion when blocked
const OFF_BLOCK = 0.3;   // small extra warm offset under a blocking high
const LUP_BLOCK = 1.5;   // up-jump intensity multiplier
const BETA_BLOCK = 1.15; // GPD scale multiplier (bigger heat spikes)
const LDN_BLOCK = 0.5;   // down-jump intensity multiplier (fewer cold fronts)
const DGAIN_BLOCK = 1.3; // faster drying under clear blocked skies

// ---- drought / soil-moisture deficit D ----
const D_GAIN = 0.045;    // build-up per deg C above seasonal+structural baseline
const D_RECH = 0.020;    // baseline recharge / day
const D_RAIN = 0.55;     // recharge when a cold front brings rain

// ---- diurnal range (for Tmin / tropical nights) ----
function dtr(d, hot) { const base = 9.5 - 1.5 * Math.max(0, Math.cos(W * (d - S_PEAK))); return hot ? base - 2.0 : base; }

const HOT = 30, DESERT = 35, TROP_NIGHT = 20;
const CITY = 'Berlin';
const RUN_ID = 'run_' + new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);

// ---- monthly accumulators (for printed report) ----
const months = { 7: 'Juli', 8: 'August', 9: 'September' };
const acc = {}; for (const m of [7, 8, 9]) acc[m] = { tmaxMean: [], hot: [], desert: [], trop: [], peak: [] };
let blockedDays = 0, totalDays = 0;

// ---- CSV output (streamed) ----
const out = fs.createWriteStream(OUT_CSV);
out.write('run_id,path,date,doy,city,tmax,tmin,jet_state,drought,hot,desert,tropical_night\n');
let buf = '';
function flush() { if (buf) { out.write(buf); buf = ''; } }

for (let p = 0; p < N_PATHS; p++) {
  let T = 33.0;                 // start near current hot state (Berlin ~33 C, 25 Jun)
  let D = 0.35;                 // moderate pre-existing dryness
  let blocked = true;          // current heat dome = blocking regime
  const pm = { 7: { sum: 0, n: 0, hot: 0, desert: 0, trop: 0, peak: -99 },
               8: { sum: 0, n: 0, hot: 0, desert: 0, trop: 0, peak: -99 },
               9: { sum: 0, n: 0, hot: 0, desert: 0, trop: 0, peak: -99 } };

  for (let i = 0; i < DAYS; i++) {
    const d = START + i;

    // jet regime transition
    if (blocked) { if (rand() < P_UNBLOCK) blocked = false; }
    else { if (rand() < pBlock(d)) blocked = true; }

    const kappa = blocked ? K_BLOCK : KAPPA;
    const target = S(d) + A(i) + (blocked ? OFF_BLOCK : 0);

    // diffusion + drift
    T += (Sdot(d) + kappa * (target - T)) + sigma(d) * randn();

    // up-jumps: GPD (Pareto) tail, rate boosted by drought and blocking
    const lamUp = (LAM_BASE + LAM_DRO * D) * (blocked ? LUP_BLOCK : 1);
    if (rand() < 1 - Math.exp(-lamUp)) {
      T += Math.min(gpd(GPD_XI, GPD_BETA * (blocked ? BETA_BLOCK : 1)), JUMP_CAP);
    }
    // down-jumps: cold fronts (suppressed when blocked) + rain recharge
    let frontRain = false;
    const lamDn = LAM_DOWN * (blocked ? LDN_BLOCK : 1);
    if (rand() < 1 - Math.exp(-lamDn)) { T -= expo(JDN_MEAN); frontRain = true; }

    // drought update
    const excess = T - (S(d) + STRUCT_WARM);
    D += (D_GAIN * (blocked ? DGAIN_BLOCK : 1)) * Math.max(0, excess) - D_RECH - (frontRain ? D_RAIN : 0);
    D = Math.max(0, Math.min(1, D));

    // derived
    const isHot = T >= HOT, isDesert = T >= DESERT;
    const tmin = T - dtr(d, isHot) + 0.5 * randn();
    const isTrop = tmin >= TROP_NIGHT;
    const m = monthOf(d);

    // record CSV row
    buf += RUN_ID + ',' + p + ',' + isoDate(d) + ',' + d + ',' + CITY + ',' +
           T.toFixed(2) + ',' + tmin.toFixed(2) + ',' + (blocked ? 'blocked' : 'zonal') + ',' +
           D.toFixed(3) + ',' + (isHot ? 1 : 0) + ',' + (isDesert ? 1 : 0) + ',' + (isTrop ? 1 : 0) + '\n';
    if (buf.length > 1 << 20) flush();

    // report accumulators (Jul/Aug/Sep only; late-June still goes to the CSV dataset)
    const a = pm[m];
    if (a) {
      a.sum += T; a.n++;
      if (isHot) a.hot++; if (isDesert) a.desert++; if (isTrop) a.trop++;
      if (T > a.peak) a.peak = T;
    }
    blockedDays += blocked ? 1 : 0; totalDays++;
  }
  for (const m of [7, 8, 9]) {
    acc[m].tmaxMean.push(pm[m].sum / pm[m].n);
    acc[m].hot.push(pm[m].hot); acc[m].desert.push(pm[m].desert);
    acc[m].trop.push(pm[m].trop); acc[m].peak.push(pm[m].peak);
  }
}
flush();
out.end();

// ---- report ----
function q(arr, p) { const a = arr.slice().sort((x, y) => x - y); return a[Math.floor(p * (a.length - 1))]; }
function mean(arr) { return arr.reduce((x, y) => x + y, 0) / arr.length; }
function climMonthMean(m) {
  const first = doy(2026, m, 1), last = doy(2026, m, m === 9 ? 30 : 31);
  let sum = 0, n = 0; for (let d = first; d <= last; d++) { sum += S(d); n++; } return sum / n;
}

out.on('finish', () => {
  console.log('Berlin — Tmax-Prognose 2026 (modifiziertes Sprung-Diffusions-Modell, Pareto-Tail, ' + N_PATHS + ' Pfade)\n');
  console.log('Monat     | Ø Tmax (P10–P90)        | Anomalie | Hitzetage ≥30° | Wüstentage ≥35° | Tropennächte ≥20°');
  console.log('----------|-------------------------|----------|----------------|-----------------|------------------');
  for (const m of [7, 8, 9]) {
    const a = acc[m], mm = mean(a.tmaxMean), anom = mm - climMonthMean(m);
    console.log(
      months[m].padEnd(9) + ' | ' +
      (mm.toFixed(1) + '°C (' + q(a.tmaxMean, 0.1).toFixed(1) + '–' + q(a.tmaxMean, 0.9).toFixed(1) + ')').padEnd(23) + ' | ' +
      ('+' + anom.toFixed(1) + '°C').padEnd(8) + ' | ' +
      (mean(a.hot).toFixed(1) + ' (P90 ' + q(a.hot, 0.9) + ')').padEnd(14) + ' | ' +
      (mean(a.desert).toFixed(1) + ' (P90 ' + q(a.desert, 0.9) + ')').padEnd(15) + ' | ' +
      (mean(a.trop).toFixed(1) + ' (P90 ' + q(a.trop, 0.9) + ')'));
  }
  console.log('\nSpitzenwerte (Monats-Maximum Tmax): Median / P95 / P99');
  for (const m of [7, 8, 9])
    console.log('  ' + months[m].padEnd(9) + ' Median ' + q(acc[m].peak, 0.5).toFixed(1) + '°C   P95 ' + q(acc[m].peak, 0.95).toFixed(1) + '°C   P99 ' + q(acc[m].peak, 0.99).toFixed(1) + '°C');
  console.log('\nJet-Stream: ' + (100 * blockedDays / totalDays).toFixed(1) + '% Blocking-Tage (mittl. Episode ~' + (1 / P_UNBLOCK).toFixed(0) + ' d)');
  console.log('Referenz-Normal (1991–2020 Ø Tmax): Jul ' + climMonthMean(7).toFixed(1) + '°C, Aug ' + climMonthMean(8).toFixed(1) + '°C, Sep ' + climMonthMean(9).toFixed(1) + '°C');
  console.log('\nDatensatz geschrieben: ' + OUT_CSV + '  (run_id=' + RUN_ID + ')');
  console.log('-> DuckDB laden:  python3 forecast/load_duckdb.py');
});
