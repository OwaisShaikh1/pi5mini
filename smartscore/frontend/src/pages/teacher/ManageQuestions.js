import React, { useState } from "react";
import BulkQuestionImport from "../../components/teacher/BulkQuestionImport";
import QuestionForm from "../../components/teacher/QuestionForm";
import QuestionList from "../../components/teacher/QuestionList";
import "../../styles/css/createquiz.css";

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: "What is React?",
      points: 2,
      answers: [
        { id: "1-a", text: "A JavaScript library", correct: true },
        { id: "1-b", text: "A database", correct: false },
        { id: "1-c", text: "An operating system", correct: false },
      ],
    },
  ]);

  const addQuestion = (question) => setQuestions((prev) => [...prev, question]);
  const removeQuestion = (id) => setQuestions((prev) => prev.filter((q) => q.id !== id));
  const handleBulkImport = (imported, mode) => {
    setQuestions((prev) => (mode === "replace" ? imported : [...prev, ...imported]));
  };

  return (
    <div className="manage-questions">
      <div className="header-row">
        <div>
          <p className="eyebrow">Question bank</p>
          <h1>Manage Questions</h1>
          <p className="muted">Add single questions or bulk import a full set for the selected subject.</p>
        </div>
        <div className="mini-stats">
          <div className="pill">{questions.length} total</div>
          <div className="pill">{questions.reduce((s, q) => s + (q.points || 0), 0)} marks</div>
        </div>
      </div>

      <div className="manage-grid">
        <BulkQuestionImport onImport={handleBulkImport} />
        <QuestionForm addQuestion={addQuestion} />
      </div>

      <QuestionList questions={questions} onRemove={removeQuestion} />
    </div>
  );
};

export default ManageQuestions;
