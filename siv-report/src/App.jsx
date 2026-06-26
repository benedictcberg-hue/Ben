import ReportHeader from './components/ReportHeader.jsx'
import QuestionSection from './components/QuestionSection.jsx'
import LogTable from './components/LogTable.jsx'
import SignatureBlock from './components/SignatureBlock.jsx'
import {
  sections,
  studyMeta,
  issueLogColumns,
  observationLogColumns,
  resolvedColumns,
} from './report-data.js'

export default function App() {
  function handlePrint() {
    window.print()
  }

  return (
    <>
      <div className="export-btn-bar">
        <button className="export-btn" onClick={handlePrint}>Print / Export PDF</button>
      </div>

      <div className="report-page" id="report-root">
        <ReportHeader />

        {sections.map(s => (
          <QuestionSection key={s.id} section={s} />
        ))}

        <LogTable
          title="Issue Log"
          columns={issueLogColumns}
          rows={[]}
        />

        <LogTable
          title="Observation Log"
          columns={observationLogColumns}
          rows={[]}
        />

        <LogTable
          title="Resolved Issues and Observations connected to Monitoring Event"
          columns={resolvedColumns}
          rows={[]}
        />

        <SignatureBlock />

        <div className="report-footer">
          <span>{studyMeta.title} {studyMeta.version}</span>
          <span>Form Doc Number: {studyMeta.formDocNumber} &nbsp;|&nbsp; Parent Doc Number: {studyMeta.parentDocNumber}</span>
        </div>
      </div>
    </>
  )
}
