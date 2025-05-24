import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/css/Dashboard.css";
import MyCourses from "../../components/MyCourses";
import LeaderBoard from "../../components/Leaderboard";
import Sidebar from "../../components/Sidebar";
import CreateQuiz from "./CreateQuiz";
import { useNavigate } from "react-router-dom";
import HistoryGraph from "../../components/Graph";

const Card = ({ title, count, color }) => (
  <div className={`card ${color}`}>
    {title} <span>{count}</span>
  </div>
);

const TeacherDashboard = () => {
  const [sectionTitle, setSectionTitle] = useState("Teacher Dashboard");
  const [activeComponent, setActiveComponent] = useState("Dashboard");
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [fullQuizHistory, setFullQuizHistory] = useState([]);
  const [subjects, setSubjects] = useState(["All"]);
  const [selectedSubject, setSelectedSubject] = useState("All");

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  useEffect(() => {
    const fetchSubjectsAndHistory = async () => {
      try {
        const token = localStorage.getItem("access_token");

        // Fetch subjects
        const subjectRes = await axios.get("http://localhost:8000/api/getsubjects/?type=teacher", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedSubjects = subjectRes.data.subjects.map(s => s.name);
        setSubjects(["All", ...fetchedSubjects]);

        // Fetch quiz history
        const quizRes = await axios.get(`http://localhost:8000/api/quizhistory/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const quizzes = quizRes.data;

        const formattedData = quizzes
          .map((quiz, index) => ({
            subject: typeof quiz.subject === "string" ? quiz.subject : quiz.subject?.name,
            date: `Test ${index + 1}`,
            percentage: quiz.percentage_score,
          }))
          .filter(item => item.percentage !== undefined && item.percentage !== null);

        setFullQuizHistory(formattedData);
        setHistoryData(formattedData); // Initially show all
      } catch (err) {
        console.error("Error fetching subjects or quiz history:", err);
      }
    };

    fetchSubjectsAndHistory();
  }, []);

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
    switch (section) {
      case "Generate with AI":
        alert("Feature coming soon!");
        return;

      case "Profile":
        navigate("/profile");
        return;

      case "Log Out":
        const confirmLogOut = window.confirm("Are you sure you want to log out?");
        if (confirmLogOut) {
          localStorage.clear();
          navigate("/auth", { replace: true });
        }
        return;

      default:
        setSectionTitle(section);
        break;
    }

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
      case "LeaderBoard":
        setActiveComponent("LeaderBoard");
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

        {activeComponent === "Dashboard" && (
          <div>
            <div className="cards">
              <Card title="Completed Test" count={10} color="red" />
              <Card title="Incomplete Test" count={5} color="green" />
              <Card title="Overdue Test" count={2} color="blue" />
              <Card title="Total Test" count={15} color="purple" />
            </div>

            <div className="graph-section">
              <h3>Growth of Students</h3>
              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="subject-select">Filter by Subject: </label>
                <select
                  id="subject-select"
                  value={selectedSubject}
                  onChange={handleSubjectChange}
                >
                  {subjects.map((subj, idx) => (
                    <option key={idx} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>
              <HistoryGraph data={historyData} />
            </div>
          </div>
        )}

        <div className="content-container">
          {activeComponent === "CreateTest" && <CreateQuiz />}
          {activeComponent === "MyCourses" && <MyCourses />}
          {activeComponent === "LeaderBoard" && <LeaderBoard />}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
