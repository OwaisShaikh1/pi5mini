import React, { useState, useEffect } from "react";
import "../styles/css/Profile.css";

const Profile = () => {
  const [profileData, setProfileData] = useState({
    fullName: "N/A",
    email: "N/A",
    department: "N/A",
    year: "N/A",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const studentCode = localStorage.getItem("studentcode");
      const token = localStorage.getItem("access_token");

      if (!studentCode || !token) {
        setError("Missing student code or authentication token.");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching profile data...");

        const response = await fetch(
          `http://localhost:8000/api/student/${studentCode}/profile/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Response status:", response.status);

        if (!response.ok) {
          if (response.status === 401) {
            setError("Unauthorized: Invalid or expired token.");
          } else {
            setError(`Error: ${response.status} ${response.statusText}`);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Profile data received:", data);

        setProfileData({
          fullName: data.name || "N/A",
          email: data.email || "N/A",
          department: data.branch || "N/A",
          year: data.average_score !== undefined ? data.average_score : "N/A",
        });

        setError(null);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="profile-page">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Sidebar */}
        <div className="sidebar">
          <h2 className="sidebar-title">Profile</h2>
          <ul className="sidebar-list">
            <li className="sidebar-item">🔒 Password</li>
            <li className="sidebar-item">
              🔔 Notifications <span className="notification-badge">9</span>
            </li>
            <li className="sidebar-item">📂 Export data</li>
            <li className="sidebar-item">🔌 Plugins</li>
            <li className="sidebar-item">📝 Save Test history</li>
          </ul>
          <div className="delete-account">🗑 Delete your account</div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <h1 className="page-title">Profile</h1>

          {/* Profile Picture */}
          <div className="profile-photo-container">
            <div className="profile-photo">👤</div>
            <p className="photo-text">Profile photo</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Profile Form */}
          <form className="profile-form">
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input type="text" value={profileData.fullName} className="form-input" readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={profileData.email} className="form-input" readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input type="text" value={profileData.department} className="form-input" readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Year</label>
              <input type="text" value={profileData.year} className="form-input" readOnly />
            </div>

            {/* Buttons */}
            <div className="button-container">
              <button type="button" className="button-cancel">Cancel</button>
              <button type="button" className="button-submit">Edit profile</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
