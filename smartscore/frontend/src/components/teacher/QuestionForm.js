import React, { useState } from "react";

export default function QuestionForm({ addQuestion }) {
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    addQuestion({ questionText, options, correctIndex });
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded">
      <label className="block mb-2 font-semibold">Question</label>
      <input
        type="text"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        className="border p-2 w-full rounded"
        required
      />
      <div className="mt-2">
        {options.map((opt, index) => (
          <div key={index} className="flex items-center mb-1">
            <input
              type="radio"
              name="correct"
              checked={correctIndex === index}
              onChange={() => setCorrectIndex(index)}
              className="mr-2"
            />
            <input
              type="text"
              value={opt}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = e.target.value;
                setOptions(newOptions);
              }}
              className="border p-2 w-full rounded"
              required
            />
          </div>
        ))}
      </div>
      <button type="submit" className="mt-3 bg-blue-500 text-white px-4 py-2 rounded">
        Add Question
      </button>
    </form>
  );
}
