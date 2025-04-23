import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const QuizTest = () => {
    const { quizCode } = useParams(); // ✅ Get quiz code from URL
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/quiz/${quizCode}/`);
                setQuiz(response.data.quiz);
                setQuestions(response.data.questions);
            } catch (error) {
                console.error("Error fetching quiz:", error);
                alert("Failed to load quiz. Redirecting to home...");
                navigate("/dashboard"); // Redirect if quiz not found
            }
        };
        fetchQuiz();
    }, [quizCode, navigate]);

    const handleAnswerChange = (questionId, selectedOption) => {
        setAnswers({ ...answers, [questionId]: selectedOption });
    };

    const handleSubmitQuiz = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            alert("You must be logged in to submit a quiz.");
            navigate("/auth");
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:8000/api/submit-quiz/`,
                { quiz_code: quizCode, answers },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                alert("Quiz submitted successfully!");
                navigate("/dashboard"); // Redirect to dashboard after submission
            }
        } catch (error) {
            console.error("Error submitting quiz:", error);
            alert("Failed to submit quiz. Please try again.");
        }
    };

    if (!quiz) {
        return <p>Loading quiz...</p>;
    }

    return (
        <div>
            <h2>{quiz.topic} - Quiz</h2>
            <p>Code: {quiz.code}</p>
            <p>Time Limit: {quiz.time_limit} minutes</p>

            <form>
                {questions.map((question) => (
                    <div key={question.id}>
                        <p>{question.text}</p>
                        {question.options.map((option) => (
                            <label key={option.id}>
                                <input
                                    type="radio"
                                    name={`question_${question.id}`}
                                    value={option.id}
                                    onChange={() => handleAnswerChange(question.id, option.id)}
                                />
                                {option.text}
                            </label>
                        ))}
                    </div>
                ))}
                <button type="button" onClick={handleSubmitQuiz}>
                    Submit Quiz
                </button>
            </form>
        </div>
    );
};

export default QuizTest;
