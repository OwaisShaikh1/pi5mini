import React, { useEffect, useState } from "react";
import axios from "axios";

const MyQuiz = ({ studentCode }) => {
  const [quizData, setQuizData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("All"); // Subject filter state

  useEffect(() => {
    console.log("Student Code:", studentCode);
    if (!studentCode) return;

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

        let quizzes = response.data;

        // Sort quizzes by date (most recent first)
        quizzes.sort((a, b) => new Date(b.date_attempted) - new Date(a.date_attempted));

        console.log("Sorted Data:", quizzes);
        setQuizData(quizzes);
      } catch (error) {
        console.error("Error fetching MyQuiz:", error.response ? error.response.data : error.message);
      }
    };

    fetchMyQuiz();
  }, [studentCode]);

  return (
    <div className="leaderboard">
      <h2>My Quizzes</h2>

      {/* Quiz Table */}
      <table>
        <thead>
          <tr>
            <th>Quiz Code</th>
            <th>Topic</th>
            <th>
              Subject
              <br />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="table-dropdown"
              >
                <option value="All">All</option>
                {[...new Set(quizData.map((quiz) => quiz.subject))].map((subject, index) => (
                  <option key={index} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </th>
            <th>Score</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {quizData.length > 0 ? (
            quizData
              .filter((item) => selectedSubject === "All" || item.subject === selectedSubject) // Apply filter
              .map((item, index) => (
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

      {/* CSS Styling for Dropdown Inside Table */}
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

export default MyQuiz;
