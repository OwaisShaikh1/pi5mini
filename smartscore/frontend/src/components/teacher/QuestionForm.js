import React, { useMemo, useState } from "react";

export default function QuestionForm({ addQuestion }) {
  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState(2);
  const [options, setOptions] = useState([
    { id: 1, text: "" },
    { id: 2, text: "" },
    { id: 3, text: "" },
    { id: 4, text: "" },
  ]);
  const [correctId, setCorrectId] = useState(1);

  const trimmedOptions = useMemo(
    () => options.filter((opt) => opt.text.trim() !== ""),
    [options]
  );

  const handleAddOption = () => {
    setOptions([...options, { id: Date.now(), text: "" }]);
  };

  const handleRemoveOption = (id) => {
    if (options.length <= 2) return;
    setOptions(options.filter((opt) => opt.id !== id));
    if (correctId === id && options.length > 2) {
      setCorrectId(options.find((opt) => opt.id !== id)?.id || null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    if (trimmedOptions.length < 2) {
      alert("Please provide at least two answer options.");
      return;
    }

    const questionId = Date.now();
    const question = {
      id: questionId,
      text: questionText.trim(),
      points: Number(marks) > 0 ? Number(marks) : 1,
      answers: trimmedOptions.map((opt, idx) => ({
        id: `${questionId}-${idx}`,
        text: opt.text.trim(),
        correct: opt.id === correctId,
      })),
    };

    addQuestion(question);
    setQuestionText("");
    setMarks(2);
    setOptions([
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ]);
    setCorrectId(1);
  };

  return (
    <form onSubmit={handleSubmit} className="question-form">
      <div className="form-row">
        <label className="form-label">Question</label>
        <input
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="form-control"
          placeholder="Ask something clear and concise"
          required
        />
      </div>

      <div className="form-row inline">
        <label className="form-label">Marks</label>
        <input
          type="number"
          min="1"
          value={marks}
          onChange={(e) => setMarks(Number(e.target.value))}
          className="form-control marks"
        />
      </div>

      <div className="form-row">
        <label className="form-label">Answer options</label>
        {options.map((opt) => (
          <div key={opt.id} className="option-row">
            <input
              type="radio"
              name="correct"
              checked={correctId === opt.id}
              onChange={() => setCorrectId(opt.id)}
            />
            <input
              type="text"
              value={opt.text}
              onChange={(e) =>
                setOptions((prev) =>
                  prev.map((o) => (o.id === opt.id ? { ...o, text: e.target.value } : o))
                )
              }
              className="form-control"
              placeholder="Option text"
              required
            />
            {options.length > 2 && (
              <button type="button" className="mini-btn" onClick={() => handleRemoveOption(opt.id)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" className="mini-btn ghost" onClick={handleAddOption}>
          + Add option
        </button>
      </div>

      <div className="form-actions">
        <button type="submit" className="cta primary">Add Question</button>
        <p className="helper">Tip: mark one option as correct before saving.</p>
      </div>
    </form>
  );
}
