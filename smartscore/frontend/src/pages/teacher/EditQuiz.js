import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BulkQuestionImport from "../../components/teacher/BulkQuestionImport";
import QuestionForm from "../../components/teacher/QuestionForm";
import QuestionList from "../../components/teacher/QuestionList";
import "../../styles/css/createquiz.css";

const EditQuiz = () => {
  const [searchParams] = useSearchParams();
  const quizCode = searchParams.get("code");
  const [quizTitle, setQuizTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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

        setQuizTitle(data.title || quizCode);
        setTimeLimit(data.duration || 30);
        setQuestions(
          (data.questions || []).map((q) => ({
            id: q.id,
            text: q.text,
            points: q.marks || 2,
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

  const addQuestion = (q) => setQuestions((prev) => [...prev, q]);
  const removeQuestion = (id) => setQuestions((prev) => prev.filter((q) => q.id !== id));
  const handleBulkImport = (imported, mode) =>
    setQuestions((prev) => (mode === "replace" ? imported : [...prev, ...imported]));

  const handleSave = async () => {
    // Currently the backend does not support PUT for quiz updates; show a placeholder
    setIsSaving(true);
    setTimeout(() => {
      alert("Save functionality placeholder – connect to your backend update endpoint when ready.");
      setIsSaving(false);
    }, 600);
  };

  const totalMarks = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  if (loading) return <p>Loading quiz...</p>;
  if (!quizCode) return <p className="muted">Add ?code=YOUR_QUIZ_CODE to the URL to edit a quiz.</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="manage-questions">
      <div className="header-row">
        <div>
          <p className="eyebrow">Editing</p>
          <h1>Edit Quiz</h1>
          <p className="muted">Update quiz details and questions as needed.</p>
        </div>
        <div className="mini-stats">
          <div className="pill">{questions.length} questions</div>
          <div className="pill">{totalMarks} marks</div>
        </div>
      </div>

      <div className="quiz-details">
        <h2>Details</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="Quiz Title"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
          />
          <input
            type="number"
            placeholder="Time Limit (minutes)"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="manage-grid">
        <BulkQuestionImport onImport={handleBulkImport} />
        <QuestionForm addQuestion={addQuestion} />
      </div>

      <QuestionList questions={questions} onRemove={removeQuestion} />

      <div className="bottom-buttons" style={{ marginTop: 16 }}>
        <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
};

export default EditQuiz;
