import { useState } from "react";
import QuizSettings from "./QuizSettings";
import QuestionForm from "./QuestionForm";
import QuestionList from "./QuestionList";

export default function QuizCreator() {
  const [questions, setQuestions] = useState([]);
  const [quizSettings, setQuizSettings] = useState({ title: "", duration: 30 });

  const addQuestion = (question) => {
    setQuestions([...questions, question]);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Create a Quiz</h1>
      <QuizSettings settings={quizSettings} setSettings={setQuizSettings} />
      <QuestionForm addQuestion={addQuestion} />
      <QuestionList questions={questions} />
    </div>
  );
}
