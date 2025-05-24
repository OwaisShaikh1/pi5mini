import React from "react";
import "../styles/css/Homepage.css";
import { useNavigate } from "react-router-dom";
import Logo from "../images/Logo.jpeg";

export default function Homepage() {
  const navigate= useNavigate();

  return (
    <div className="testmasterpage">
      {/* Navbar */}
      <nav className="testmasterpage-nav">
        <h1 className="testmasterpage-headerText">SmartScore</h1>
        <div className="testmasterpage-nav-links">
          <a href="/auth?type=student&mode=login">Login</a>
          <a href="/auth?type=student&mode=signup">Register</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="testmasterpage-hero">
        <div className="testmasterpage-hero-text">
          <h2 className="testmasterpage-headerText">Streamline Your Testing Process</h2>
          <p>Create, administer, and grade tests with ease. Get valuable insights into student performance.</p>
          <div className="testmasterpage-hero-buttons">
            <button className="primary" onClick={() => navigate("/auth?type=student&mode=signup")}>Get Started</button>
            {/*<button className="secondary">View Demo</button>*/}
          </div>
        </div>
        <div className="testmasterpage-hero-image">
          <div className="testmasterpage-image-placeholder">
            <img
              src={Logo} alt="SmartScore Logo"
            />
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="testmasterpage-key-features">
        <h3 className="testmasterpage-headerText">Key Features</h3>
        <div className="testmasterpage-feature-grid">
          <div className="testmasterpage-feature-card">
            <h4>Versatile Question Types</h4>
            <p>Create multiple-choice, true/false, short answer, and essay questions with customizable point values and difficulty levels.</p>
          </div>
          <div className="testmasterpage-feature-card">
            <h4>Flexible Test Settings</h4>
            <p>Set time limits, attempt restrictions, and customize when students can view their results.</p>
          </div>
          <div className="testmasterpage-feature-card">
            <h4>Comprehensive Analytics</h4>
            <p>View detailed reports on student performance, identify knowledge gaps, and track progress over time.</p>
          </div>
        </div>
      </section>

      {/* Teachers and Students */}
      <section className="testmasterpage-section">
        <h3 className="testmasterpage-headerText">For Teachers and Students</h3>
        <div className="testmasterpage-card-grid">
          <div className="testmasterpage-card">
            <h4>Teachers</h4>
            <p>Streamline your assessment process</p>
            <ul>
              <li>Create and organize tests by subject, unit, or difficulty</li>
              <li>Automatic grading for objective questions</li>
              <li>Detailed analytics on student performance</li>
              <li>Question bank to reuse and share questions</li>
            </ul>
            <button onClick={() => navigate("/auth?type=teacher&mode=signup")}>Teacher Sign Up</button>
          </div>
          <div className="testmasterpage-card">
            <h4>Students</h4>
            <p>Take tests and track your progress</p>
            <ul>
              <li>User-friendly test-taking interface</li>
              <li>Immediate feedback on completed tests</li>
              <li>Review past attempts and track improvement</li>
              <li>Access tests from any device</li>
            </ul>
            <button onClick={() => navigate("/auth?type=student&mode=signup")}>Student Sign Up</button>
          </div>
        </div>
      </section>
    </div>
  );
}
