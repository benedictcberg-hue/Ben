function AnswerBadge({ answer }) {
  const lower = (answer || '').toLowerCase()
  const cls = lower === 'yes' ? 'answer-badge--yes'
            : lower === 'no'  ? 'answer-badge--no'
            : 'answer-badge--na'
  return <span className={`answer-badge ${cls}`}>{answer || 'NA'}</span>
}

export default function QuestionSection({ section }) {
  return (
    <div className="section-block">
      <div className="section-title">
        <span className="section-title__num">{section.id}.</span>
        {section.title}
      </div>
      {section.preamble && (
        <p className="section-preamble">{section.preamble}</p>
      )}
      {section.questions.map(q => (
        <div className="question-row" key={q.id}>
          <div className="question-id">{q.id}</div>
          <div className="question-body">
            <div className="question-text">{q.text}</div>
            {q.comment
              ? <div className="question-comment">{q.comment}</div>
              : <div className="question-comment question-comment--empty">No comment entered.</div>
            }
          </div>
          <AnswerBadge answer={q.answer} />
        </div>
      ))}
    </div>
  )
}
