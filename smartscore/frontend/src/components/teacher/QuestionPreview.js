export default function QuestionPreview({ question }) {
  const answers = question.answers
    || question.choices
    || (question.options ? question.options.map((text, idx) => ({ id: idx, text, correct: idx === question.correctIndex })) : []);

  const marks = question.points || question.marks || 0;

  return (
    <div className="preview-card">
      <div className="preview-header">
        <p className="preview-title">{question.text || question.questionText}</p>
        <span className="pill soft">{marks} marks</span>
      </div>
      <ul className="preview-list">
        {answers.map((opt, index) => {
          const isCorrect = opt.correct || opt.is_correct || index === question.correctIndex;
          return (
            <li key={opt.id || index} className={isCorrect ? "correct" : ""}>
              {opt.text}
              {isCorrect && <span className="tag">Correct</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
