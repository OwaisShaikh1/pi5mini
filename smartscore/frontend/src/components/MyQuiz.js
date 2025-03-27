import React, { useEffect, useState } from "react";
import axios from "axios";

const MyQuiz = ({ studentCode }) => {
  const [quizData, setQuizData] = useState([]);
  
  useEffect(() => {
    if (!studentCode) return; // Ensure studentCode is valid

    const fetchMyQuiz = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          console.error("No access token found!");
          return;
        }

        const response = await axios.get(
          `http://127.0.0.1:8000/api/student/${studentCode}/quizzes/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Fetched Data:", response.data);
        setQuizData(response.data);
      } catch (error) {
        console.error("Error fetching MyQuiz:", error.response ? error.response.data : error.message);
      }
    };

    fetchMyQuiz();
  }, [studentCode]); // Runs whenever studentCode changes

  return (
    <div className="leaderboard">
      <h2>My Quizzes</h2>
      <table>
        <thead>
          <tr>
            <th>Quiz Code</th>
            <th>Topic</th>
            <th>Subject</th>
            <th>Score</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {quizData.length > 0 ? (
            quizData.map((item, index) => (
              <tr key={index}>
                <td>{item.quiz_code}</td>
                <td>{item.quiz_title}</td>
                <td>{item.subject}</td>
                <td>{item.score}</td>
                <td>{item.percentage_score}%</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "10px" }}>
                No quizzes attempted yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MyQuiz;
