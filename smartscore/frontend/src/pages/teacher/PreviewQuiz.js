import React from "react";
import QuestionPreview from "../../components/teacher/QuestionPreview"

const PreviewQuiz = ({ quizDetails, questions }) => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Preview Quiz: {quizDetails.title}</h1>
      <p>Time Limit: {quizDetails.timeLimit} mins</p>
      {questions.map((q, index) => (
        <QuestionPreview key={index} question={q} />
      ))}
    </div>
  );
};

export default PreviewQuiz;
