import React, { useState } from "react";
import "../../styles/css/Dashboard.css"; // Ensure correct path
import MyCourses from "../../components/MyCourses"; // Teacher courses
import LeaderBoard from "../../components/Leaderboard";
import Sidebar from "../../components/teacher/sidebar";
import CreateQuiz from "./CreateQuiz";
import { useNavigate } from "react-router-dom";
// import AIQuiz from "./AIQuiz"; // Uncomment when available
// import Settings from "./Settings"; // Uncomment when available

const Card = ({ title, count, color }) => (
  <div className={`card ${color}`}>
    {title} <span>{count}</span>
  </div>
);

const TeacherDashboard = () => {
  const [sectionTitle, setSectionTitle] = useState("Teacher Dashboard");
  const [activeComponent, setActiveComponent] = useState("Dashboard"); // Default to Dashboard
  const navigate=useNavigate();

  const changeSection = (section) => {
    setSectionTitle(section);

    switch (section) {
      case "Dashboard":
        setActiveComponent("Dashboard");
        break;
      case "Create Test":
        setActiveComponent("CreateTest");
        break;
      case "My Courses":
        setActiveComponent("MyCourses");
        break;
      case "Generate with AI":
        setActiveComponent("GenerateWithAI");
        break;
      case "LeaderBoard":
        setActiveComponent("LeaderBoard");
        break;
      case "Log Out":
        localStorage.removeItem("access_token"); // Optional: Clear stored token
        localStorage.removeItem("teachercode");  // Optional: Clear teacher code
        navigate("/auth");
        break;
      default:
        setActiveComponent("Dashboard");
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar changeSection={changeSection} />
      <div className="main-content">
        <h2>{sectionTitle}</h2>

        {/* Cards Section (Only for Dashboard) */}
        {activeComponent === "Dashboard" && (
          <div className="cards">
            <Card title="Completed Test" count={10} color="red" />
            <Card title="Incomplete Test" count={5} color="green" />
            <Card title="Overdue Test" count={2} color="blue" />
            <Card title="Total Test" count={15} color="purple" />
          </div>
        )}

        {/* Component Rendering */}
        <div className="content-container">
          {activeComponent === "CreateTest" && <CreateQuiz />}
          {activeComponent === "GenerateWithAI" && <CreateQuiz />}
          {activeComponent === "MyCourses" && <MyCourses />}
          {activeComponent === "LeaderBoard" && <LeaderBoard />}
          {/* Uncomment below when Settings Component is available */}
          {/* {activeComponent === "Settings" && <Settings />} */}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
