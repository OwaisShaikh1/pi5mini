import React from "react";
import QuestionPreview from "./QuestionPreview";

export default function QuestionList({ questions, onRemove }) {
  const totalMarks = questions.reduce((sum, q) => sum + (q.points || q.marks || 0), 0);

  return (
    <div className="question-list">
      <div className="list-header">
        <h2>Added Questions</h2>
        <span className="pill">{questions.length} items · {totalMarks} marks</span>
      </div>

      {questions.length === 0 ? (
        <p className="muted">No questions added yet.</p>
      ) : (
        questions.map((q, index) => (
          <div key={q.id || index} className="list-item">
            <QuestionPreview question={q} />
            {onRemove && (
              <button type="button" className="mini-btn danger" onClick={() => onRemove(q.id || index)}>
                Remove
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
