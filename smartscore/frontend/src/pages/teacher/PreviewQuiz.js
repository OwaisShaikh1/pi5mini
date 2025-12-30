import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import QuestionPreview from "../../components/teacher/QuestionPreview";
import "../../styles/css/createquiz.css";

const PreviewQuiz = () => {
  const [searchParams] = useSearchParams();
  const quizCode = searchParams.get("code");
  const [quizDetails, setQuizDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!quizCode) {
      setLoading(false);
      return;
    }

    const fetchQuiz = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/quiz/${quizCode}/`);
        if (!response.ok) throw new Error("Quiz not found");
        const data = await response.json();

        setQuizDetails({
          title: data.title || quizCode,
          code: data.code,
          totalScore: data.total_score,
          timeLimit: data.duration,
        });

        setQuestions(
          (data.questions || []).map((q) => ({
            id: q.id,
            text: q.text,
            points: q.marks || 0,
            answers: (q.choices || []).map((c) => ({
              id: c.id,
              text: c.text,
              correct: c.is_correct,
            })),
          }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizCode]);

  if (loading) return <p>Loading quiz preview...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!quizCode) return <p className="muted">No quiz code specified. Use ?code=YOUR_QUIZ_CODE in the URL.</p>;

  const totalMarks = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  return (
    <div className="manage-questions">
      <div className="header-row">
        <div>
          <p className="eyebrow">Preview</p>
          <h1>{quizDetails?.title || "Quiz Preview"}</h1>
          <p className="muted">Review the quiz content before publishing.</p>
        </div>
        <div className="mini-stats">
          <div className="pill">{questions.length} questions</div>
          <div className="pill">{totalMarks} marks</div>
          <div className="pill">{quizDetails?.timeLimit ?? 30} mins</div>
        </div>
      </div>

      <div className="question-list">
        {questions.length === 0 ? (
          <p className="muted">No questions found for this quiz.</p>
        ) : (
          questions.map((q, index) => (
            <div key={q.id || index} className="list-item" style={{ marginBottom: 12 }}>
              <QuestionPreview question={q} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PreviewQuiz;
