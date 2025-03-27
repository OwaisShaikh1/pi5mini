import React, { useState } from "react";
import QuestionPreview from "./QuestionPreview";

export default function QuestionList({ questions }) {
  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Added Questions</h2>
      {questions.length === 0 ? (
        <p className="text-gray-500">No questions added yet.</p>
      ) : (
        questions.map((q, index) => <QuestionPreview key={index} question={q} />)
      )}
    </div>
  );
}
