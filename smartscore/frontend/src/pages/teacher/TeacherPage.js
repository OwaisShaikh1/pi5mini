import React, { useState } from "react";
import Sidebar from "../../components/teacher/sidebar";
import CreateQuiz from "./CreateQuiz";
import EditQuiz from "./EditQuiz";
//import AIQuiz from "./AIQuiz";
//import Leaderboard from "./Leaderboard";
//import Settings from "./Settings";

const TeacherDashboard = () => {
  const [activeSection, setActiveSection] = useState("Dashboard");

  const renderSection = () => {
    switch (activeSection) {
      case "Dashboard":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-red-500 text-white p-6 rounded-lg text-center shadow-md">
              <h3 className="text-lg font-semibold">Completed Test</h3>
              <p className="text-3xl font-bold">10</p>
            </div>
            <div className="bg-teal-500 text-white p-6 rounded-lg text-center shadow-md">
              <h3 className="text-lg font-semibold">Incomplete Test</h3>
              <p className="text-3xl font-bold">5</p>
            </div>
            <div className="bg-blue-600 text-white p-6 rounded-lg text-center shadow-md">
              <h3 className="text-lg font-semibold">Overdue Test</h3>
              <p className="text-3xl font-bold">2</p>
            </div>
            <div className="bg-purple-600 text-white p-6 rounded-lg text-center shadow-md">
              <h3 className="text-lg font-semibold">Total Test</h3>
              <p className="text-3xl font-bold">15</p>
            </div>
          </div>
        );
      case "Create Test":
        return <CreateQuiz />;
      case "My Courses":
        return <EditQuiz />;
      default:
        return <h2 className="text-2xl font-bold">Welcome!</h2>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar changeSection={setActiveSection} />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">{activeSection}</h1>
        {renderSection()}
      </div>
    </div>
  );
};

export default TeacherDashboard;
