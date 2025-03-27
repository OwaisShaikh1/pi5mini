import React from "react";
import { Routes, Route } from "react-router-dom";
import Footer from "./components/layout/Footer";

// Import pages
import NotFoundPage from "./pages/NotFoundPage";
import AuthForm from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import CreateQuiz from "./pages/teacher/CreateQuiz";
import EditQuiz from "./pages/teacher/EditQuiz";
import ManageQuestions from "./pages/teacher/ManageQuestions";
import PreviewQuiz from "./pages/teacher/PreviewQuiz";
import TeacherDashboard from "./pages/teacher/TeacherPage";

const App = () => {
  return (
    
    <div className="min-h-screen p-4 flex flex-col justify-between"
    >
        <Routes>
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/createquiz" element={<CreateQuiz/>} />
        <Route path="/editquiz" element={<EditQuiz/>} />
        <Route path="/Managequestions" element={<ManageQuestions/>} />
        <Route path="/Previewquiz" element={<PreviewQuiz/>} />
        <Route path="/Teacher" element={<TeacherDashboard/>} />
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
      <Footer />  {/* Ensure Footer is included */}
    </div>
  );
};

export default App;
