import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, CheckCircle, XCircle, Home, RotateCcw, ChevronDown, ChevronUp, Award, Target, Zap } from "lucide-react";
import "../styles/css/ResultsPage.css";

const ResultsPage = ({ results, examData, userAnswers, totalMarks }) => {
  const { score, totalQuestions, questionResults, totalMarks: apiTotalMarks } = results;
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [animateScore, setAnimateScore] = useState(0);

  // Use totalMarks from API response if available, otherwise fall back to prop
  const actualTotalMarks = apiTotalMarks || totalMarks;
  const percentage = actualTotalMarks > 0 ? Math.round((score / actualTotalMarks) * 100) : 0;
  
  // Calculate stats
  const correctCount = useMemo(() => {
    return Object.values(questionResults).filter(q => q?.is_correct).length;
  }, [questionResults]);
  
  const wrongCount = totalQuestions - correctCount;

  // Determine grade and emoji
  const getGradeInfo = (pct) => {
    if (pct >= 90) return { grade: "A+", emoji: "🏆", message: "Outstanding!", color: "#10b981" };
    if (pct >= 80) return { grade: "A", emoji: "🌟", message: "Excellent!", color: "#22c55e" };
    if (pct >= 70) return { grade: "B", emoji: "👏", message: "Great job!", color: "#84cc16" };
    if (pct >= 60) return { grade: "C", emoji: "👍", message: "Good effort!", color: "#eab308" };
    if (pct >= 50) return { grade: "D", emoji: "💪", message: "Keep trying!", color: "#f97316" };
    return { grade: "F", emoji: "📚", message: "Study more!", color: "#ef4444" };
  };

  const gradeInfo = getGradeInfo(percentage);

  // Animate score counting up
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = percentage / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= percentage) {
        setAnimateScore(percentage);
        clearInterval(timer);
      } else {
        setAnimateScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [percentage]);

  // Show confetti for good scores
  useEffect(() => {
    if (percentage >= 70) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [percentage]);

  const toggleQuestion = (id) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Calculate circumference for progress ring
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animateScore / 100) * circumference;

  return (
    <div className="results-page">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="results-header">
        <div className="header-content">
          <span className="header-badge">📋 Quiz Complete</span>
          <h1>{examData.title || "Quiz Results"}</h1>
        </div>
      </div>

      {/* Main Score Card */}
      <div className="score-section">
        <div className="score-card">
          <div className="score-visual">
            {/* Circular Progress */}
            <svg className="progress-ring" viewBox="0 0 200 200">
              <circle
                className="progress-ring-bg"
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                strokeWidth="12"
              />
              <circle
                className="progress-ring-fill"
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ stroke: gradeInfo.color }}
              />
            </svg>
            <div className="score-center">
              <span className="score-emoji">{gradeInfo.emoji}</span>
              <span className="score-percentage">{animateScore}%</span>
              <span className="score-grade" style={{ color: gradeInfo.color }}>{gradeInfo.grade}</span>
            </div>
          </div>

          <div className="score-details">
            <h2 className="score-message" style={{ color: gradeInfo.color }}>{gradeInfo.message}</h2>
            <p className="score-points">
              <Trophy className="icon" /> {score} / {actualTotalMarks} points
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-row">
          <div className="stat-card correct">
            <CheckCircle className="stat-icon" />
            <div className="stat-info">
              <span className="stat-value">{correctCount}</span>
              <span className="stat-label">Correct</span>
            </div>
          </div>
          <div className="stat-card wrong">
            <XCircle className="stat-icon" />
            <div className="stat-info">
              <span className="stat-value">{wrongCount}</span>
              <span className="stat-label">Wrong</span>
            </div>
          </div>
          <div className="stat-card total">
            <Target className="stat-icon" />
            <div className="stat-info">
              <span className="stat-value">{totalQuestions}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Question Breakdown */}
      <div className="breakdown-section">
        <div className="section-header">
          <h2><Zap className="icon" /> Question Breakdown</h2>
          <span className="section-hint">Click to expand details</span>
        </div>

        <div className="questions-list">
          {examData.questions.map((question, index) => {
            const userAnswer = userAnswers[question.id] || "No answer";
            const qResult = questionResults[question.id];
            const isCorrect = qResult?.is_correct;
            const questionMarks = qResult?.marks || 0;
            const isExpanded = expandedQuestions[question.id];

            return (
              <div
                key={question.id}
                className={`result-question-card ${isCorrect ? 'correct' : 'incorrect'}`}
              >
                <button
                  className="question-header"
                  onClick={() => toggleQuestion(question.id)}
                >
                  <div className="question-status">
                    {isCorrect ? (
                      <CheckCircle className="status-icon correct" />
                    ) : (
                      <XCircle className="status-icon incorrect" />
                    )}
                    <span className="question-num">Q{index + 1}</span>
                  </div>
                  <span className="question-preview">
                    {question.text.length > 60 ? question.text.substring(0, 60) + '...' : question.text}
                  </span>
                  <span className="question-result-badge">
                    {isCorrect ? '+' + questionMarks : '0'} / {questionMarks} pts
                  </span>
                  {isExpanded ? <ChevronUp className="expand-icon" /> : <ChevronDown className="expand-icon" />}
                </button>

                {isExpanded && (
                  <div className="question-details">
                    <p className="full-question">{question.text}</p>
                    
                    <div className="answer-comparison">
                      <div className={`answer-box ${isCorrect ? 'correct' : 'incorrect'}`}>
                        <span className="answer-label">Your Answer</span>
                        <span className="answer-text">{userAnswer}</span>
                      </div>
                      
                      {!isCorrect && (
                        <div className="answer-box correct">
                          <span className="answer-label">Correct Answer</span>
                          <span className="answer-text">{question.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="results-actions">
        <button className="action-btn secondary" onClick={() => navigate('/dashboard')}>
          <Home className="btn-icon" /> Back to Dashboard
        </button>
        <button className="action-btn primary" onClick={() => window.location.reload()}>
          <RotateCcw className="btn-icon" /> Try Again
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
