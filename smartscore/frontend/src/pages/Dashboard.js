import React, { useState } from "react";
import "../styles/css/Dashboard.css"; // Ensure correct path
import Sidebar from "../components/Sidebar";
import MyQuiz from "../components/MyQuiz";
import MyCourses from "../components/MyCourses"; // Import MyCourses
import LeaderBoard from "../components/Leaderboard";

const Card = ({ title, count, color }) => (
  <div className={`card ${color}`}>
    {title} <span>{count}</span>
  </div>
);

const Dashboard = () => {
  const [sectionTitle, setSectionTitle] = useState("Dashboard");
  const [activeComponent, setActiveComponent] = useState("Dashboard"); // Default to Dashboard

  const changeSection = (section) => {
    setSectionTitle(section);

    switch (section) {
      case "My Courses":
        setActiveComponent("MyCourses");
        break;
      case "Test":
        setActiveComponent("MyQuiz");
        break;
      case "LeaderBoard":
        setActiveComponent("LeaderBoard");
        break;
      case "Settings":
        setActiveComponent("Settings");
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
          {activeComponent === "MyQuiz" && <MyQuiz />}
          {activeComponent === "MyCourses" && <MyCourses />}
          {activeComponent === "LeaderBoard" && <LeaderBoard />}
          {activeComponent === "Settings" && <MyCourses />} {/* Update this if needed */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
