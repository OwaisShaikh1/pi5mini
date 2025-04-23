import React, { useState } from "react";

const Sidebar = ({ changeSection }) => {
  const sections = ["Dashboard", "My Courses", "LeaderBoard", "Settings", "Quizzes", "History", "Log Out"];
  const [activeSection, setActiveSection] = useState("Dashboard");

  const handleFooterClick = (item) => {
    console.log(`Footer item clicked: ${item}`);
    
    switch (item) {
      case "Profile":
        changeSection("Profile"); // Navigate to Profile section
        break;
      case "Notifications":
        alert("Notifications clicked! (Feature coming soon)");
        break;
      case "Help":
        alert("Help Section: Contact support@example.com");
        break;
      default:
        break;
    }
  };

  return (
    <div className="sidebar" style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100vh",
      padding: "20px",
      boxSizing: "border-box"
    }}>
      <h2>SMARTSCORE</h2>
      <ul style={{ flexGrow: 1 }}>
        {sections.map((section) => (
          <li
            key={section}
            className={activeSection === section ? "active" : ""}
            onClick={() => {
              console.log("Clicked:", section); // Debugging
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
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
