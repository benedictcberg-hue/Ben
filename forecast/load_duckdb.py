#!/usr/bin/env python3
"""Load the simulated daily dataset into DuckDB and run the aggregation queries.

Reads data/forecast_daily.csv (produced by forecast/simulate.js), (re)creates the
schema in data/heatwave.duckdb, APPENDS the run's rows (so the dataset grows across
runs), executes forecast/queries.sql, and exports data/forecast_summary.csv.

Requires: pip install duckdb   (native Node build is slow; we use the Python binding.)
"""
import os
import sys

try:
    import duckdb
except ImportError:
    sys.exit("duckdb not installed. Run: pip install duckdb")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DB = os.path.join(ROOT, "data", "heatwave.duckdb")
CSV = os.path.join(ROOT, "data", "forecast_daily.csv")
SQL = os.path.join(HERE, "queries.sql")
SUMMARY = os.path.join(ROOT, "data", "forecast_summary.csv")

if not os.path.exists(CSV):
    sys.exit(f"missing {CSV}. Run: node forecast/simulate.js")

con = duckdb.connect(DB)

# Schema (idempotent). sim_daily accumulates rows across runs, keyed by run_id.
con.execute("""
CREATE TABLE IF NOT EXISTS runs (
    run_id   TEXT PRIMARY KEY,
    created  TIMESTAMP DEFAULT now(),
    n_paths  INTEGER,
    n_rows   INTEGER
);
CREATE TABLE IF NOT EXISTS sim_daily (
    run_id          TEXT,
    path            INTEGER,
    date            DATE,
    doy             INTEGER,
    city            TEXT,
    tmax            DOUBLE,
    tmin            DOUBLE,
    jet_state       TEXT,
    drought         DOUBLE,
    hot             BOOLEAN,
    desert          BOOLEAN,
    tropical_night  BOOLEAN
);
""")

# Stage the CSV, then append only new run_ids (so re-runs extend, not duplicate).
con.execute(f"""
CREATE OR REPLACE TEMP TABLE staging AS
SELECT run_id, path, CAST(date AS DATE) AS date, doy, city, tmax, tmin, jet_state,
       drought, CAST(hot AS BOOLEAN) AS hot, CAST(desert AS BOOLEAN) AS desert,
       CAST(tropical_night AS BOOLEAN) AS tropical_night
FROM read_csv_auto('{CSV}', header=True);
""")

new_runs = con.execute(
    "SELECT DISTINCT run_id FROM staging WHERE run_id NOT IN (SELECT run_id FROM runs)"
).fetchall()

if not new_runs:
    print("No new run_id in CSV — dataset already contains it; skipping append.")
else:
    con.execute("""
        INSERT INTO sim_daily SELECT * FROM staging
        WHERE run_id NOT IN (SELECT run_id FROM runs);
    """)
    con.execute("""
        INSERT INTO runs (run_id, n_paths, n_rows)
        SELECT run_id, count(DISTINCT path), count(*)
        FROM staging WHERE run_id NOT IN (SELECT run_id FROM runs)
        GROUP BY run_id;
    """)
    for (rid,) in new_runs:
        print(f"appended run_id={rid}")

# Dataset overview.
tot_rows, tot_runs, tot_paths = con.execute(
    "SELECT count(*), count(DISTINCT run_id), count(DISTINCT run_id || '|' || path) FROM sim_daily"
).fetchone()
print(f"\nDataset: {tot_rows:,} rows across {tot_runs} run(s).")

# Run the aggregation queries over the full dataset (queries.sql aggregates per-path).
with open(SQL) as f:
    # Drop comment lines first (a comment may contain ';'), then split on statement ';'.
    sql_text = "\n".join(ln for ln in f.read().splitlines() if not ln.strip().startswith("--"))
    statements = [s.strip() for s in sql_text.split(";") if s.strip()]

labels = ["Monatsübersicht (Tmax-Verteilung + Hitzemetriken)",
          "Jet-Stream-Anteil & Dürre je Monat",
          "Kopplungs-Check: Tmax nach Jet-Regime"]

def show(cols, rows):
    widths = [max(len(str(c)), *(len(str(r[i])) for r in rows)) if rows else len(str(c))
              for i, c in enumerate(cols)]
    line = lambda vals: "  ".join(str(v).rjust(widths[i]) for i, v in enumerate(vals))
    print(line(cols))
    print("  ".join("-" * w for w in widths))
    for r in rows:
        print(line(r))

results = []
for i, stmt in enumerate(statements):
    cur = con.execute(stmt)
    cols = [d[0] for d in cur.description]
    rows = cur.fetchall()
    results.append((cols, rows))
    print("\n=== " + (labels[i] if i < len(labels) else f"Query {i+1}") + " ===")
    show(cols, rows)

# Export the monthly summary (first query) as a small committed CSV (no pandas).
import csv
cols, rows = results[0]
with open(SUMMARY, "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(cols)
    w.writerows(rows)
print(f"\nSummary exported: {SUMMARY}")
print(f"DuckDB:          {DB}")
con.close()
