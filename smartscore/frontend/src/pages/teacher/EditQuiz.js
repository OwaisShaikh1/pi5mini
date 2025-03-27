import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import QuizSettings from "../../components/teacher/QuizSettings";
import QuestionForm from "../../components/teacher/QuestionForm"
import QuestionList from "../../components/teacher/QuestionList";

const EditQuiz = () => {
  const { quizId } = useParams();
  const [quizDetails, setQuizDetails] = useState({ title: "", timeLimit: 30 });
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Fetch quiz details from API
    // setQuizDetails(fetchedQuizDetails);
    // setQuestions(fetchedQuestions);
  }, [quizId]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Quiz</h1>
      <QuizSettings details={quizDetails} setDetails={setQuizDetails} />
      <QuestionForm questions={questions} setQuestions={setQuestions} />
      <QuestionList questions={questions} />
    </div>
  );
};

export default EditQuiz;
