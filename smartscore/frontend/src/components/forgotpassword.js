import React, { useState } from "react";
import "../styles/css/AuthForm.css";

export default function ForgetPasswordPage() {
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    user_type: "student", // default to student
  });
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = "http://127.0.0.1:8000/api/forgot/";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code.trim(),
          email: formData.email.trim(),
          user_type: formData.user_type,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Verification successful. Your password has been sent to your email.");
      } else {
        setMessage("Something went wrong. Unable to find email.");
      }
    } catch (error) {
      setMessage("Failed to connect to the server.");
    }

    setSubmitted(true);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Forgot Password</h2>
        {submitted ? (
          <p className="message-text text-green-600">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {/* ✅ User Type Toggle */}
            <div className="user-type-options">
              <label>
                <input
                  type="radio"
                  name="user_type"
                  value="student"
                  checked={formData.user_type === "student"}
                  onChange={() =>
                    setFormData({ ...formData, user_type: "student" })
                  }
                />
                Student
              </label>
              <label>
                <input
                  type="radio"
                  name="user_type"
                  value="teacher"
                  checked={formData.user_type === "teacher"}
                  onChange={() =>
                    setFormData({ ...formData, user_type: "teacher" })
                  }
                />
                Teacher
              </label>
            </div>

            <div className="input-group">
              <label htmlFor="code">Code</label>
              <input
                id="code"
                type="text"
                required
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Enter your unique code"
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter your registered email"
              />
            </div>

            <button type="submit" className="auth-button">
              Retrieve Password
            </button>
          </form>
        )}
        <p className="toggle-text">
          Remember your password?{" "}
          <a href="/auth" className="toggle-button">
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
}
