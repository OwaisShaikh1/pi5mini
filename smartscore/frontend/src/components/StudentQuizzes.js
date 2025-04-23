import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

const StudentQuizzes = () => {
  const navigate = useNavigate(); 
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/quizzes/");
        console.log("Fetched Quizzes:", response.data);
        setQuizzes(response.data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    fetchQuizzes();
  }, []);

  const handleAttemptQuiz = async (quizCode) => {
    console.log(`Attempting quiz with Code: ${quizCode}`); 

    const token = localStorage.getItem("access_token");

    if (!token) {
        alert("You must be logged in to attempt a quiz.");
        navigate("/auth");
        return;
    }

    try {
        const response = await axios.post(
            "http://localhost:8000/api/attempt-quiz/",
            { quiz_code: quizCode },  // ✅ Send quiz_code instead of quiz_id
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Quiz attempt response:", response.data);

        if (response.status === 200) {
            alert("Quiz started successfully! Proceed to the quiz page.");
        }
    } catch (error) {
        console.error("Error attempting quiz:", error.response?.data || error);
        alert("Failed to start the quiz. Please try again.");
    }
};




  return (
    <div className="leaderboard">
      <h2>Available Quizzes</h2>
      <table>
      <thead>
        <tr>
          <th>Quiz Code</th><th>Topic</th><th>Score</th><th>Time Limit</th><th>Action</th>
        </tr>
      </thead>
        <tbody>
          {quizzes.length > 0 ? (
            quizzes.map((quiz, index) => (
              <tr key={index}>
                <td>{quiz.code || "N/A"}</td>
                <td>{quiz.topic || "N/A"}</td>
                <td>{quiz.score ?? "N/A"}</td>
                <td>{quiz.time_limit ? `${quiz.time_limit} min` : "N/A"}</td>
                <td>
                  <button 
                    onClick={() => handleAttemptQuiz(quiz.code)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Attempt Quiz
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "10px" }}>
                No quizzes available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentQuizzes;
