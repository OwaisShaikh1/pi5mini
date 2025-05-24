import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/AlertDialog"; // 🔄 Make sure this path uses lowercase 'alert-dialog'
import ResultsPage from "./ResultPage";
import "../styles/css/TestPage.css";

const TestPage = () => {
  const { quizCode } = useParams();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // Default 30 mins
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [quizTitle, setQuizTitle] = useState("Quiz");
  const [totalMarks, setTotalMarks] = useState(0);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/quiz/${quizCode}/`)
      .then((res) => {
        const data = res.data;
        setQuestions(data.questions || []);
        setQuizTitle(data.title || "Quiz");
        setTotalMarks(data.total_score || 0);
        setTimeLeft((data.duration || 30) * 60);
      })
      .catch((err) => console.error("Error fetching quiz:", err));
  }, [quizCode]);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 && !hasSubmitted) handleSubmit();
  }, [timeLeft, hasSubmitted]);

  const formatTime = (seconds) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
      seconds % 60
    ).padStart(2, "0")}`;

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
        {
          quiz_id: quizCode,
          answers: selectedAnswers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => setResults(res.data))
      .catch((err) => {
        console.error("Submit error:", err);
        if (err.response?.status === 401) {
          alert("Session expired. Please log in again.");
        }
      });
  };

  if (results) {
    const examData = {
      title: quizTitle,
      questions: results.questionResults.map((q) => ({
        id: q.id,
        text: q.text,
        correctAnswer: q.correct_answer,
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

  if (!questions.length) {
    return <p className="text-center text-gray-500 mt-10">Loading quiz...</p>;
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="test-page-container">
      <div className="test-header">
        <h1 className="test-title">{quizTitle}</h1>
        <div className="test-timer">
          <Clock className="icon" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <p className="test-instructions">
        Answer each question. Navigate using buttons. Submit when ready.
      </p>

      <div className="test-content">
        <div className="test-question-section">
          <h3>
            Question {currentIndex + 1} of {questions.length}
          </h3>
          <p className="question-text">{currentQ.text}</p>

          {currentQ.choices.map((choice) => (
            <label key={choice.id} className="test-choice">
              <input
                type="radio"
                name={`question-${currentQ.id}`}
                value={choice.id}
                checked={selectedAnswers[currentQ.id] === choice.id}
                onChange={() => handleAnswer(currentQ.id, choice.id)}
              />
              {choice.text}
            </label>
          ))}

          <div className="test-navigation">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="icon" /> Previous
            </Button>

            {currentIndex === questions.length - 1 ? (
              <Button
                className="test-submit-btn"
                onClick={() => setShowSubmitDialog(true)}
                disabled={hasSubmitted}
              >
                Submit Test
              </Button>
            ) : (
              <Button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(prev + 1, questions.length - 1)
                  )
                }
              >
                Next <ChevronRight className="icon" />
              </Button>
            )}
          </div>
        </div>

        <div className="test-sidebar">
          <h3>Questions</h3>
          <div className="test-sidebar-questions">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`test-sidebar-btn ${
                  currentIndex === index ? "active" : ""
                } ${selectedAnswers[questions[index].id] ? "answered" : ""}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Alert Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog} hideClose>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit your test?</AlertDialogTitle>
            <AlertDialogDescription>
              You’ve answered {Object.keys(selectedAnswers).length} out of {questions.length} questions.
              Once submitted, you can’t change your answers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <button
              className="continue-btn"
              onClick={() => setShowSubmitDialog(false)}
            >
              Continue Exam
            </button>
            <button
              className="submit-btn"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit();
                setShowSubmitDialog(false);
              }}
            >
              Submit Exam
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestPage;
