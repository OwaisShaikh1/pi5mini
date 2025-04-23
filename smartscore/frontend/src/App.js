import React from "react";
import { Routes, Route } from "react-router-dom";

// Import pages
import NotFoundPage from "./pages/NotFoundPage";
import AuthForm from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import CreateQuiz from "./pages/teacher/CreateQuiz";
import EditQuiz from "./pages/teacher/EditQuiz";
import ManageQuestions from "./pages/teacher/ManageQuestions";
import PreviewQuiz from "./pages/teacher/PreviewQuiz";
import TeacherDashboard from "./pages/teacher/teacherdashboard";
import Profile from "./components/Profile";

const App = () => {
  return (
    <div style={{
      height: "100vh",
      width: "100vw",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      overflow: "hidden",
      position: "fixed"
    }}>
      <Routes>
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/createquiz" element={<CreateQuiz />} />
        <Route path="/editquiz" element={<EditQuiz />} />
        <Route path="/Managequestions" element={<ManageQuestions />} />
        <Route path="/Previewquiz" element={<PreviewQuiz />} />
        <Route path="/Teacher" element={<TeacherDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};


export default App;
