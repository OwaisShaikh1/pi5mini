import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/css/ResultsPage.css";

const ResultsPage = ({ results, examData, userAnswers, totalMarks }) => {
  const { score, totalQuestions, questionResults } = results;
  const navigate = useNavigate();

  // ⏳ Auto-redirect after 8 seconds (optional)
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 8000);

    return () => clearTimeout(timer); // Cleanup
  }, [navigate]);

  return (
    <div className="results-container">
      <h1 className="results-title">Quiz Results</h1>
      <p className="results-summary">
        You scored <strong>{score}</strong> out of{" "}
        <strong>{totalMarks}</strong> (
        {((score / totalMarks) * 100).toFixed(1)}%)
      </p>

      <button className="back-button" onClick={() => navigate("/dashboard")}>
        ⬅ Back to Dashboard
      </button>

      <div className="results-breakdown">
        {examData.questions.map((question, index) => {
          const userAnswer = userAnswers[question.id] || "No answer";
          const isCorrect = questionResults[question.id]?.is_correct;
          const correctAnswerText = question.correctAnswer;

          return (
            <div
              key={question.id}
              className={`results-question ${isCorrect ? "correct" : "wrong"}`}
            >
              <h3>
                Q{index + 1}: {question.text}
              </h3>
              <p>
                <strong>Your Answer:</strong>{" "}
                <span className={isCorrect ? "correct" : "wrong"}>
                  {userAnswer}
                </span>
              </p>
              {!isCorrect && (
                <p>
                  <strong>Correct Answer:</strong>{" "}
                  <span className="correct">{correctAnswerText}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsPage;
