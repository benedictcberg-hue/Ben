export default function SignatureBlock() {
  return (
    <>
      <div className="followup-section">
        <h3>Follow Up Items</h3>
        <table className="log-table">
          <thead>
            <tr>
              <th>Action Item</th>
              <th>Responsible Party</th>
              <th>Status</th>
              <th>Date Identified</th>
              <th>Date Resolved</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {[0,1,2].map(i => (
              <tr key={i} className="empty-row">
                <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
                <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="signature-block">
        <div className="sig-box">
          <div className="sig-box__label">Author of the Report</div>
          <div className="sig-box__field">
            <span className="sig-box__field-label">Name:</span>
            <span>&nbsp;</span>
          </div>
          <div className="sig-box__field">
            <span className="sig-box__field-label">Date:</span>
            <span>&nbsp;</span>
          </div>
          <div className="sig-box__field" style={{ height: '40px' }}>
            <span className="sig-box__field-label">Signature:</span>
            <span>&nbsp;</span>
          </div>
        </div>
        <div className="sig-box">
          <div className="sig-box__label">Reviewer of the Report</div>
          <div className="sig-box__field">
            <span className="sig-box__field-label">Name:</span>
            <span>&nbsp;</span>
          </div>
          <div className="sig-box__field">
            <span className="sig-box__field-label">Date:</span>
            <span>&nbsp;</span>
          </div>
          <div className="sig-box__field" style={{ height: '40px' }}>
            <span className="sig-box__field-label">Signature:</span>
            <span>&nbsp;</span>
          </div>
        </div>
      </div>
    </>
  )
}
