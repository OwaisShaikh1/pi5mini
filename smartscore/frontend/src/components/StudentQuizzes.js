import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentQuizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("All");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/quizzes/");
        console.log("Fetched Quizzes:", response.data);

        if (Array.isArray(response.data)) {
          let sortedQuizzes = response.data.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          ); // Sorting by most recent quizzes
          setQuizzes(sortedQuizzes);
        } else {
          console.error("Invalid API response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    fetchQuizzes();
  }, []);

  const handleAttemptQuiz = async (quizCode) => {
    console.log(`Attempting quiz with Code: ${quizCode}`);

    const studentCode = localStorage.getItem("studentcode");
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("You must be logged in to attempt a quiz.");
      navigate("/auth");
      return;
    }

    if (!studentCode) {
      alert("Student code is missing. Please log in first.");
      navigate("/auth");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/attempt-quiz/",
        { student_code: studentCode, quiz_code: quizCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Quiz attempt response:", response.data);

      if (response.status === 200) {
        const { attempt_id } = response.data;

        alert("Quiz started successfully! Proceed to the quiz page.");
        navigate(`/quiz/${quizCode}/${attempt_id}`);
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
            <th>Quiz Title</th>
            <th>
              Subject
              <br />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="table-dropdown"
              >
                <option value="All">All</option>
                {[...new Set(quizzes.map((quiz) => quiz.subject))].map((subject, index) => (
                  <option key={index} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </th>
            <th>Score</th>
            <th>Time Limit</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.length > 0 ? (
            quizzes
              .filter((quiz) => selectedSubject === "All" || quiz.subject === selectedSubject) // Apply subject filter
              .map((quiz, index) => (
                <tr key={index}>
                  <td>{quiz.code || "N/A"}</td>
                  <td>{quiz.subject || "N/A"}</td>
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
                        fontSize: "14px",
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

      {/* CSS Styling for Dropdown */}
      <style>{`
        .table-dropdown {
          margin-top: 5px;
          padding: 5px;
          font-size: 14px;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default StudentQuizzes;
