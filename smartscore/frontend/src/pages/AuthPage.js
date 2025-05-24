import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/css/AuthForm.css";

const AuthForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initial states
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState("student");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    email: "",
    password: "",
    branch_name: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [branches, setBranches] = useState([]);

  // Set isLogin and userType from URL query on first render
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get("type");   // "student" or "teacher"
    const mode = searchParams.get("mode");   // "login" or "signup"

    if (type === "teacher" || type === "student") {
      setUserType(type);
    }

    if (mode === "login") {
      setIsLogin(true);
    } else if (mode === "signup") {
      setIsLogin(false);
    }
  }, [location.search]);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/branches/");
        if (!response.ok) throw new Error("Failed to fetch branches");
        const data = await response.json();
        setBranches(data);
      } catch (error) {
        console.error("Error loading branches:", error);
      }
    };
    fetchBranches();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!isLogin && !formData.name.trim()) newErrors.name = "Name is required";
    if (!isLogin && !formData.email.trim()) newErrors.email = "Email is required";
    if (!isLogin && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.code.trim()) newErrors.code = "Code is required";
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!isLogin && userType === "student" && !formData.branch_name) {
      newErrors.branch_name = "Branch is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const url = isLogin
      ? "http://127.0.0.1:8000/api/login/"
      : "http://127.0.0.1:8000/api/signup/";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code.trim(),
          password: formData.password,
          user_type: userType,
          ...(isLogin ? {} : {
            name: formData.name.trim(),
            email: formData.email.trim(),
            branch_name: formData.branch_name,
          }),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(isLogin ? "Login successful!" : "Signup successful!");
        if (isLogin) {
          if (data.access_token) {
            localStorage.clear();
            localStorage.setItem("access_token", data.access_token);
          }

          if (userType === "student") {
            localStorage.setItem("studentcode", formData.code);
            navigate("/dashboard");
          } else {
            localStorage.setItem("teachercode", formData.code);
            navigate("/teacher");
          }
        }
      } else {
        setMessage(data.error || "Something went wrong");
      }
    } catch (error) {
      setMessage("Failed to connect to the server");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">{isLogin ? "Login" : "Sign Up"}</h2>
        {message && <p className="message-text">{message}</p>}
        <div className="toggle-user-type">
          <label>
            <input
              type="radio"
              name="user_type"
              value="student"
              checked={userType === "student"}
              onChange={() => setUserType("student")}
            />
            Student
          </label>
          <label>
            <input
              type="radio"
              name="user_type"
              value="teacher"
              checked={userType === "teacher"}
              onChange={() => setUserType("teacher")}
            />
            Teacher
          </label>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="input-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                />
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>
            </>
          )}
          {userType === "student" && !isLogin && (
            <div className="input-group">
              <label>Branch</label>
              <select
                name="branch_name"
                value={formData.branch_name}
                onChange={handleChange}
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.name} value={branch.name}>
                    {branch.name}
                  </option>
                ))}
              </select>
              {errors.branch_name && (
                <p className="error-text">{errors.branch_name}</p>
              )}
            </div>
          )}
          <div className="input-group">
            <label>Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Enter your unique code"
            />
            {errors.code && <p className="error-text">{errors.code}</p>}
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••"
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>
          <button type="submit" className="auth-button">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <p className="toggle-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="toggle-button"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
          <br />
          {"Forgot password?"}
          <button
            onClick={() => navigate("/forgotpassword")} // Assuming you have routing set up
            className="toggle-button"
          >
            Retrieve Password?
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
