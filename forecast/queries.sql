-- Aggregation queries over the simulated daily dataset (sim_daily).
-- These reproduce the printed monthly report directly from the raw per-path rows,
-- proving consistency between the simulation output and the summary statistics.

-- Monthly Tmax distribution + heat metrics (one row per calendar month).
-- Path-level monthly means feed the P10/P90 band; day-level flags feed the counts.
WITH path_month AS (
  SELECT path,
         month(date)                         AS mon,
         avg(tmax)                            AS tmax_mean,
         sum(hot)                             AS hot_days,
         sum(desert)                          AS desert_days,
         sum(tropical_night)                  AS tropical_nights,
         max(tmax)                            AS peak_tmax
  FROM sim_daily
  WHERE month(date) IN (7, 8, 9)   -- full forecast months (late-June is partial)
  GROUP BY path, month(date)
)
SELECT
  mon                                                                AS month,
  round(avg(tmax_mean), 1)                                           AS tmax_mean,
  round(quantile_cont(tmax_mean, 0.10), 1)                          AS tmax_p10,
  round(quantile_cont(tmax_mean, 0.90), 1)                          AS tmax_p90,
  round(avg(hot_days), 1)                                            AS hot_days_avg,
  round(quantile_cont(hot_days, 0.90), 0)                            AS hot_days_p90,
  round(avg(desert_days), 1)                                         AS desert_days_avg,
  round(avg(tropical_nights), 1)                                     AS tropical_nights_avg,
  round(quantile_cont(peak_tmax, 0.50), 1)                          AS peak_median,
  round(quantile_cont(peak_tmax, 0.95), 1)                          AS peak_p95,
  round(quantile_cont(peak_tmax, 0.99), 1)                          AS peak_p99
FROM path_month
GROUP BY mon
ORDER BY mon;

-- Jet-stream regime share + drought level, by month.
SELECT month(date)                                          AS month,
       round(100.0 * avg(CAST(jet_state = 'blocked' AS INT)), 1) AS blocked_pct,
       round(avg(drought), 3)                               AS drought_mean
FROM sim_daily
WHERE month(date) IN (7, 8, 9)
GROUP BY month(date)
ORDER BY 1;

-- Coupling check: mean Tmax is higher on blocked days than zonal days.
SELECT jet_state,
       round(avg(tmax), 2)                    AS tmax_mean,
       round(100.0 * avg(CAST(hot AS INT)), 1) AS hot_day_pct
FROM sim_daily
GROUP BY jet_state
ORDER BY tmax_mean DESC;
