import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/AlertDialog";
import ResultsPage from "./ResultPage";
import "../styles/css/TestPage.css";

const TestPage = () => {
  const { quizCode } = useParams();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [quizTitle, setQuizTitle] = useState("Quiz");
  const [totalMarks, setTotalMarks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/quiz/${quizCode}/`)
      .then((res) => {
        const data = res.data;
        setQuestions(data.questions || []);
        setQuizTitle(data.title || "Quiz");
        setTotalMarks(data.total_score || 0);
        setTimeLeft((data.duration || 30) * 60);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching quiz:", err);
        setIsLoading(false);
      });
  }, [quizCode]);

  useEffect(() => {
    if (isLoading || hasSubmitted) return;
    const timer = setInterval(() => setTimeLeft((prev) => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [isLoading, hasSubmitted]);

  useEffect(() => {
    if (timeLeft <= 0 && !hasSubmitted) handleSubmit();
  }, [timeLeft, hasSubmitted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const getTimeStatus = () => {
    if (timeLeft <= 60) return "critical";
    if (timeLeft <= 300) return "warning";
    return "normal";
  };

  const handleAnswer = (questionId, choiceId) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  const handleSubmit = () => {
    if (hasSubmitted) return;
    setHasSubmitted(true);
    const token = localStorage.getItem("access_token");

    axios
      .post(
        "http://localhost:8000/api/submit-quiz/",
        { quiz_id: quizCode, answers: selectedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => setResults(res.data))
      .catch((err) => {
        console.error("Submit error:", err);
        if (err.response?.status === 401) {
          alert("Session expired. Please log in again.");
        }
      });
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  if (results) {
    const examData = {
      title: quizTitle,
      questions: Object.values(results.questionResults).map((q) => ({
        id: q.id,
        text: q.text,
        correctAnswer: q.correct_answer,
        marks: q.marks,
      })),
    };

    const userAnswers = {};
    for (const [qid, cid] of Object.entries(selectedAnswers)) {
      const question = questions.find((q) => q.id.toString() === qid);
      const choice = question?.choices.find((c) => c.id === cid);
      if (choice) userAnswers[qid] = choice.text;
    }

    return (
      <ResultsPage
        results={results}
        examData={examData}
        userAnswers={userAnswers}
        totalMarks={totalMarks}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="quiz-loading">
        <div className="loading-spinner"></div>
        <h2>Loading your quiz...</h2>
        <p>Get ready to show what you know! 🚀</p>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="quiz-error">
        <span className="error-emoji">😕</span>
        <h2>No questions found</h2>
        <p>This quiz doesn't have any questions yet.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="quiz-container">
      {/* Header with gamified elements */}
      <div className="quiz-header">
        <div className="quiz-info">
          <span className="quiz-badge">📚 Quiz</span>
          <h1 className="quiz-title">{quizTitle}</h1>
        </div>
        <div className={`quiz-timer ${getTimeStatus()}`}>
          <Clock className="timer-icon" />
          <span className="timer-display">{formatTime(timeLeft)}</span>
          {timeLeft <= 300 && <span className="timer-warning">⚡</span>}
        </div>
      </div>

      {/* Progress Section */}
      <div className="quiz-progress-section">
        <div className="progress-info">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span className="progress-stats">
            <CheckCircle className="icon-small" /> {answeredCount} answered
          </span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="quiz-main">
        {/* Question Card */}
        <div className="question-card">
          <div className="question-badge">
            <span className="q-number">Q{currentIndex + 1}</span>
            <span className="q-points">⭐ {currentQ.marks || 1} {currentQ.marks === 1 ? 'point' : 'points'} available</span>
          </div>
          
          <h2 className="question-text">{currentQ.text}</h2>

          <div className="choices-grid">
            {currentQ.choices.map((choice, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === choice.id;
              const letter = String.fromCharCode(65 + idx);
              
              return (
                <button
                  key={choice.id}
                  className={`choice-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAnswer(currentQ.id, choice.id)}
                >
                  <span className="choice-letter">{letter}</span>
                  <span className="choice-text">{choice.text}</span>
                  {isSelected && <CheckCircle className="choice-check" />}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="question-nav">
            <Button
              variant="outline"
              className="nav-btn prev"
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft /> Previous
            </Button>

            {currentIndex === questions.length - 1 ? (
              <Button
                className="nav-btn submit"
                onClick={() => setShowSubmitDialog(true)}
                disabled={hasSubmitted}
              >
                🎯 Submit Quiz
              </Button>
            ) : (
              <Button
                className="nav-btn next"
                onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
              >
                Next <ChevronRight />
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar - Question Navigator */}
        <div className="quiz-sidebar">
          <div className="sidebar-header">
            <h3>📋 Questions</h3>
            <span className="sidebar-progress">{answeredCount}/{questions.length}</span>
          </div>
          
          <div className="question-grid">
            {questions.map((q, index) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = currentIndex === index;
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`q-nav-btn ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : 'unanswered'}`}
                >
                  {index + 1}
                  {isAnswered && <span className="answered-dot">✓</span>}
                </button>
              );
            })}
          </div>

          <div className="sidebar-legend">
            <div className="legend-item">
              <span className="legend-dot answered"></span>
              <span>Answered</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot unanswered"></span>
              <span>Not answered</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot current"></span>
              <span>Current</span>
            </div>
          </div>

          <div className="sidebar-tip">
            💡 <strong>Tip:</strong> Review all questions before submitting!
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog} hideClose>
        <AlertDialogContent className="submit-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              <span className="dialog-icon">🎯</span>
              Ready to Submit?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="submit-summary">
                <div className="summary-row">
                  <span>✅ Answered</span>
                  <span className="value">{answeredCount} questions</span>
                </div>
                <div className="summary-row">
                  <span>⚠️ Unanswered</span>
                  <span className="value warning">{questions.length - answeredCount} questions</span>
                </div>
                <div className="summary-row">
                  <span>⏱️ Time remaining</span>
                  <span className="value">{formatTime(timeLeft)}</span>
                </div>
              </div>
              <p className="submit-warning">
                Once submitted, you cannot change your answers.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <button className="dialog-btn secondary" onClick={() => setShowSubmitDialog(false)}>
              📝 Continue Quiz
            </button>
            <button
              className="dialog-btn primary"
              onClick={() => {
                handleSubmit();
                setShowSubmitDialog(false);
              }}
            >
              🚀 Submit Now
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestPage;