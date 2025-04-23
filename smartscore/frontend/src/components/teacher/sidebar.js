import React, { useState } from "react";

const Sidebar = ({ changeSection }) => {
  const sections = ["Dashboard", "Create Test", "Generate with AI", "My Courses", "LeaderBoard", "Log Out"];
  const [activeSection, setActiveSection] = useState("Dashboard");

  return (
    <div className="sidebar">
      <h2>SMARTSCORE</h2>
      <ul className="sidebar-menu">
        {sections.map((section) => (
          <li
            key={section}
            className={activeSection === section ? "active" : ""}
            onClick={() => {
              setActiveSection(section);
              changeSection(section);
            }}
          >
            {section}
          </li>
        ))}
      </ul>
      <div className="sidebar-footer" style={{ marginBottom: "40px" }}> {/* Shifts the footer slightly up */}
        <ul>
          <li>Profile</li>
          <li>Notifications</li>
          <li>Help</li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;