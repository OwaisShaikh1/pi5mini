import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const TakeQuiz = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        fetch(`http://localhost:8000/api/quiz/${quizId}/`)
            .then(response => response.json())
            .then(data => setQuiz(data))
            .catch(error => console.error("Error fetching quiz:", error));
    }, [quizId]);

    if (!quiz) return <p>Loading quiz...</p>;

    const currentQuestion = quiz.questions[currentQuestionIndex];

    const handleAnswerSelect = (answerId) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestion.id]: answerId
        });
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const submitQuiz = async () => {
        const submissionData = {
            quiz_id: quizId,
            answers: selectedAnswers
        };

        try {
            const response = await fetch("http://localhost:8000/api/submit-quiz/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(submissionData)
            });

            const result = await response.json();
            if (response.ok) {
                setSubmitted(true);
                setScore(result.score);
            } else {
                alert("Error submitting quiz.");
            }
        } catch (error) {
            console.error("Error submitting quiz:", error);
        }
    };

    return (
        <div className="take-quiz-container">
            <h1>{quiz.title}</h1>

            {submitted ? (
                <div>
                    <h2>Quiz Completed!</h2>
                    <p>Your Score: {score}/{quiz.total_score}</p>
                    <button onClick={() => navigate("/")}>Back to Quizzes</button>
                </div>
            ) : (
                <div>
                    <h2>Question {currentQuestionIndex + 1} of {quiz.questions.length}</h2>
                    <p>{currentQuestion.text}</p>

                    {currentQuestion.choices.map(choice => (
                        <div key={choice.id}>
                            <input
                                type="radio"
                                id={`choice-${choice.id}`}
                                name="answer"
                                checked={selectedAnswers[currentQuestion.id] === choice.id}
                                onChange={() => handleAnswerSelect(choice.id)}
                            />
                            <label htmlFor={`choice-${choice.id}`}>{choice.text}</label>
                        </div>
                    ))}

                    {currentQuestionIndex < quiz.questions.length - 1 ? (
                        <button onClick={nextQuestion}>Next</button>
                    ) : (
                        <button onClick={submitQuiz}>Submit Quiz</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default TakeQuiz;
