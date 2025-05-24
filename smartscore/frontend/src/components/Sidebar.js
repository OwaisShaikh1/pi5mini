import React, { useState, useEffect } from "react";

const Sidebar = ({ changeSection }) => {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [userType, setUserType] = useState("student"); // default fallback

  useEffect(() => {
    const studentCode = localStorage.getItem("studentcode");
    const teacherCode = localStorage.getItem("teachercode");

    if (teacherCode) {
      setUserType("teacher");
    } else if (studentCode) {
      setUserType("student");
    }
  }, []);

  const studentSections = ["Dashboard", "My Courses", "LeaderBoard", "History", "Quizzes", "Settings"];
  const teacherSections = ["Dashboard", "Create Test", "Generate with AI", "My Courses", "LeaderBoard"];

  const sections = userType === "teacher" ? teacherSections : studentSections;

  const handleFooterClick = (item) => {
    console.log(`Footer item clicked: ${item}`);

    switch (item) {
      case "Profile":
        changeSection("Profile");
        break;
      case "Notifications":
        alert("Notifications clicked! (Feature coming soon)");
        break;
        case "Help":
          const helpMessage = `
        For any issues or support, please contact:
        
        📧 Email: soham0518@gmail.com
        
        Click OK to open your email client.
        `;
          const proceed = window.confirm(helpMessage);
          if (proceed) {
            window.open("mailto:soham0518@gmail.com?subject=SmartScore%20Support");
          }
          break;
      case "Log Out":
        console.log("Logging out...");
        changeSection("Log Out");
        break;
      default:
        break;
    }
  };

  return (
    <div
      className="sidebar"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        padding: "20px",
        boxSizing: "border-box"
      }}
    >
      <h2>SMARTSCORE</h2>
      <ul style={{ flexGrow: 1 }}>
        {sections.map((section) => (
          <li
            key={section}
            className={activeSection === section ? "active" : ""}
            onClick={() => {
              console.log("Clicked:", section);
              setActiveSection(section);
              changeSection(section);
            }}
          >
            {section}
          </li>
        ))}
      </ul>
      <div className="sidebar-footer" style={{ marginBottom: "20px" }}>
        <ul>
          <li onClick={() => handleFooterClick("Profile")}>Profile</li>
          <li onClick={() => handleFooterClick("Notifications")}>Notifications</li>
          <li onClick={() => handleFooterClick("Help")}>Help</li>
          <li onClick={() => handleFooterClick("Log Out")}>Log Out</li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
