import React, { useEffect, useState } from "react";
import axios from "axios";

const LeaderBoard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("All"); // Subject filter

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/leaderboard/");
        console.log("Fetched Data:", response.data);

        if (Array.isArray(response.data)) {
          let sortedData = response.data.sort((a, b) => b.marks - a.marks); // Sort by highest marks
          setLeaderboardData(sortedData);
        } else {
          console.error("Invalid API response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard">
      <h2>LeaderBoard</h2>
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Marks</th>
            <th>
              Subject
              <br />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="table-dropdown"
              >
                <option value="All">All</option>
                {[...new Set(leaderboardData.map((item) => item.subject))].map((subject, index) => (
                  <option key={index} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.length > 0 ? (
            leaderboardData
              .filter((item) => selectedSubject === "All" || item.subject === selectedSubject) // Apply filter
              .map((item, index) => (
                <tr key={index}>
                  <td>{item.name || "Unknown"}</td>
                  <td>{item.marks !== undefined ? item.marks : "N/A"}</td>
                  <td>{item.subject ? item.subject : "Unknown"}</td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center", padding: "10px" }}>
                No data available
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

export default LeaderBoard;
