const EMPTY_ROWS = 3

export default function LogTable({ title, columns, rows = [] }) {
  const totalRows = Math.max(rows.length, EMPTY_ROWS)
  const displayRows = [
    ...rows,
    ...Array(Math.max(0, EMPTY_ROWS - rows.length)).fill(null),
  ]

  return (
    <div className="log-section">
      <h3>{title}</h3>
      <table className="log-table">
        <thead>
          <tr>{columns.map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {displayRows.map((row, i) => (
            <tr key={i} className={!row ? 'empty-row' : ''}>
              {columns.map((c, j) => (
                <td key={j}>{row ? (row[c] ?? '') : ' '}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
