import React, { useEffect, useState } from "react";
import axios from "axios";

const LeaderBoard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/leaderboard/");
        console.log("Fetched Data:", response.data); // Debugging API response
        setLeaderboardData(response.data);
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
            <th>Subject</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.length > 0 ? (
            leaderboardData.map((item, index) => (
              <tr key={index}>
                <td>{item.name || "Unknown"}</td> 
                <td>{item.marks ?? "N/A"}</td> 
                <td>{item.subject || "Unknown"}</td> 
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
    </div>
  );
};

export default LeaderBoard;
