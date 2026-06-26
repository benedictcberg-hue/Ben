import { studyMeta, headerFields, personnelRows } from '../report-data.js'

export default function ReportHeader() {
  return (
    <>
      <div className="az-header">
        <div className="az-header__brand">AstraZeneca</div>
        <div className="az-header__titles">
          <div className="az-header__report-title">{studyMeta.title}</div>
          <div className="az-header__meta">{studyMeta.version} &nbsp;|&nbsp; Form Doc Number: {studyMeta.formDocNumber} &nbsp;|&nbsp; Parent Doc Number: {studyMeta.parentDocNumber}</div>
        </div>
      </div>

      <div className="admin-block">
        <div className="admin-grid">
          {headerFields.map(f => (
            <div className="admin-row" key={f.id}>
              <span className="admin-row__label">{f.label}:</span>
              <span className={`admin-row__value${f.value ? '' : ' admin-row__value--empty'}`}>
                {f.value || '—'}
              </span>
            </div>
          ))}
        </div>

        <div className="attendees-block">
          <h4>Personnel Present</h4>
          <table className="attendees-table">
            <thead>
              <tr><th>Name</th><th>Role / Function</th><th>Present (Y/N)</th></tr>
            </thead>
            <tbody>
              {personnelRows.map((r, i) => (
                <tr key={i}>
                  <td>{r.name || ' '}</td>
                  <td>{r.role}</td>
                  <td>{r.present || ' '}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
