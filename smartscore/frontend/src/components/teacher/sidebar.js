import React, { useState } from "react";

const Sidebar = ({ changeSection }) => {
  const sections = ["Dashboard", "Create Test", "Generate with AI", "My Courses", "LeaderBoard", "Settings"];
  const [activeSection, setActiveSection] = useState("Dashboard");

  return (
    <div className="sidebar">
      <h2>SMARTSCORE</h2>
      <ul>
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
      <div className="sidebar-footer">
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

