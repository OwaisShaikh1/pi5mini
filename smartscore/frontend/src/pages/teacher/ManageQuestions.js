import React, { useState } from "react";
import QuestionList from "../../components/teacher/QuestionList";

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([
    { id: 1, text: "What is React?", type: "MCQ", options: ["Library", "Framework", "Language"], answer: "Library" }
  ]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Questions</h1>
      <QuestionList questions={questions} />
    </div>
  );
};

export default ManageQuestions;
