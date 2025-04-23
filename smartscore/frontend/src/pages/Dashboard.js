import React, { useState, useEffect } from "react";
import "../styles/css/Dashboard.css"; // Ensure correct path
import Sidebar from "../components/Sidebar";
import MyQuiz from "../components/MyQuiz";
import MyCourses from "../components/MyCourses";
import LeaderBoard from "../components/Leaderboard";
import StudentQuizzes from "../components/StudentQuizzes";
import { useNavigate } from "react-router-dom";


const Card = ({ title, count, color }) => (
  <div className={`card ${color}`}>
    {title} <span>{count}</span>
  </div>
);



const Dashboard = () => {
  const [sectionTitle, setSectionTitle] = useState("Dashboard");
  const [activeComponent, setActiveComponent] = useState("Dashboard");
  const navigate= useNavigate();

  const [studentCode, setStudentCode] = useState(localStorage.getItem("studentcode"));

  useEffect(() => {
    setStudentCode(localStorage.getItem("studentcode")); // Update if storage changes
  }, []);


  const changeSection = (section) => {
    console.log("Navigating to:", section);
    
    setSectionTitle(section);
    
    setActiveComponent(() => {
      switch (section) {
        case "My Courses":
          return "MyCourses";
        case "History":
          return "MyQuiz";
        case "LeaderBoard":
          return "LeaderBoard";
        case "Settings":
          return "Settings";
        case "Quizzes":
          return "StudentQuizzes";
        case "Profile":
          navigate("/profile");
          break;
        case "Log Out":
          localStorage.removeItem("access_token"); // Optional: Clear stored token
          localStorage.removeItem("studentcode");  // Optional: Clear student code
          navigate("/auth");
          break;
        default:
          return "Dashboard";
      }
    });
  };

  // ✅ Log state updates correctly AFTER the re-render
  useEffect(() => {
    console.log("✅ Active Component (after render):", activeComponent);
  }, [activeComponent]);

  return (
    <div className="dashboard-container">
      <Sidebar changeSection={changeSection} />
      <div className="main-content">
        <h2>{sectionTitle}</h2>

        {/* Cards Section */}
        {activeComponent === "Dashboard" && (
          <div className="cards">
            <Card title="Completed Test" count={10} color="red" />
            <Card title="Incomplete Test" count={5} color="green" />
            <Card title="Overdue Test" count={2} color="blue" />
            <Card title="Total Test" count={15} color="purple" />
          </div>
        )}

        {/* Conditional Rendering for Components */}
        <div className="content-container">
          {activeComponent === "MyQuiz" && <MyQuiz studentCode={studentCode} />}
          {activeComponent === "MyCourses" && <MyCourses />}
          {activeComponent === "LeaderBoard" && <LeaderBoard />}
          {activeComponent === "StudentQuizzes" && <StudentQuizzes />}
          {activeComponent === "Settings" && <MyCourses />} {/* Update if needed */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
