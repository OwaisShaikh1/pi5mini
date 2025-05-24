import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/css/Dashboard.css";
import Sidebar from "../components/Sidebar";
import MyQuiz from "../components/MyQuiz";
import MyCourses from "../components/MyCourses";
import LeaderBoard from "../components/Leaderboard";
import StudentQuizzes from "../components/StudentQuizzes";
import HistoryGraph from "../components/Graph";
import axios from "axios";

const Card = ({ title, count, color }) => (
  <div className={`card ${color}`}>
    {title} <span>{count}</span>
  </div>
);

const Dashboard = () => {
  const [sectionTitle, setSectionTitle] = useState("Dashboard");
  const [activeComponent, setActiveComponent] = useState("Dashboard");
  const navigate = useNavigate();
  const [studentCode, setStudentCode] = useState(localStorage.getItem("studentcode"));
  const [historyData, setHistoryData] = useState([]);
  const [fullQuizHistory, setFullQuizHistory] = useState([]); // Full quiz data
  const [subjects, setSubjects] = useState(["All"]);
  const [selectedSubject, setSelectedSubject] = useState("All");

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get("http://localhost:8000/api/getsubjects/?type=student", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSubjects(["All", ...res.data.subjects.map(s => s.name)]);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await axios.get(
          `http://localhost:8000/api/student/${studentCode}/quizzes/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const quizzes = response.data;

        const formattedData = quizzes
          .map((quiz, index) => ({
            subject: typeof quiz.subject === "string" ? quiz.subject : quiz.subject?.name,
            date: `Test ${index + 1}`,
            percentage: quiz.percentage_score,
          }))
          .filter(item => item.percentage !== undefined && item.percentage !== null);

        setFullQuizHistory(formattedData);
        setHistoryData(formattedData); // initial load: all quizzes
      } catch (error) {
        console.error("Error fetching quiz history:", error);
      }
    };

    fetchQuizHistory();
  }, [studentCode]);

  useEffect(() => {
    if (selectedSubject === "All") {
      setHistoryData(fullQuizHistory);
    } else {
      const filtered = fullQuizHistory.filter(
        (quiz) => quiz.subject === selectedSubject
      );
      setHistoryData(filtered);
    }
  }, [selectedSubject, fullQuizHistory]);

  const changeSection = (section) => {
    console.log("Navigating to:", section);

    if (section === "Log Out") {
      const confirmLogOut = window.confirm("Are you sure you want to log out?");
      if (confirmLogOut) {
        localStorage.clear();
        navigate("/auth", { replace: true });
      }
      return;
    }

    if (section === "Settings") {
      alert("Settings clicked! (Feature coming soon)");
      return;
    }

    setSectionTitle(section);

    setActiveComponent(() => {
      switch (section) {
        case "My Courses":
          return "MyCourses";
        case "History":
          return "MyQuiz";
        case "LeaderBoard":
          return "LeaderBoard";
        case "Quizzes":
          return "StudentQuizzes";
        case "Profile":
          navigate("/profile");
          return null;
        default:
          return "Dashboard";
      }
    });
  };

  return (
    <div className="dashboard-container">
      <Sidebar changeSection={changeSection} />
      <div className="main-content">
        <h2>{sectionTitle}</h2>

        {activeComponent === "Dashboard" && (
          <div>
            <div className="cards">
              <Card title="Completed Test" count={10} color="red" />
              <Card title="Incomplete Test" count={5} color="green" />
              <Card title="Overdue Test" count={2} color="blue" />
              <Card title="Total Test" count={15} color="purple" />
            </div>

            <div className="graph-section">
              <h3>Performance Over Time</h3>
              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="subject-select">Filter by Subject: </label>
                <select
                  id="subject-select"
                  value={selectedSubject}
                  onChange={handleSubjectChange}
                >
                  {subjects.map((subj, idx) => (
                    <option key={idx} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>
              <HistoryGraph data={historyData} />
            </div>
          </div>
        )}

        <div className="content-container">
          {activeComponent === "MyQuiz" && <MyQuiz studentCode={studentCode} />}
          {activeComponent === "MyCourses" && <MyCourses />}
          {activeComponent === "LeaderBoard" && <LeaderBoard />}
          {activeComponent === "StudentQuizzes" && <StudentQuizzes />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
