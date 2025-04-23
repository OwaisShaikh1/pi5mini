import React, { useState, useEffect } from "react";
import "../styles/css/Profile.css";

const TeacherProfile = () => {
  const [profileData, setProfileData] = useState({
    fullName: "N/A",
    email: "N/A",
    subject: "N/A",
    isStaff: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const teacherCode = localStorage.getItem("teachercode");
      const token = localStorage.getItem("access_token");

      if (!teacherCode || !token) {
        setError("Missing teacher code or authentication token.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8000/api/teacher/${teacherCode}/profile/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
        setProfileData({
          fullName: data.name || "N/A",
          email: data.email || "N/A",
          subject: data.subject || "N/A",
          isStaff: data.is_staff || false,
        });
        setError(null);
      } catch (err) {
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
        <div className="sidebar">
          <h2 className="sidebar-title">Teacher Profile</h2>
          <ul className="sidebar-list">
            <li className="sidebar-item">🔒 Password</li>
            <li className="sidebar-item">📂 Manage Classes</li>
            <li className="sidebar-item">📊 View Reports</li>
            <li className="sidebar-item">🔌 Plugins</li>
          </ul>
        </div>

        <div className="main-content">
          <h1 className="page-title">Teacher Profile</h1>

          <div className="profile-photo-container">
            <div className="profile-photo">👨‍🏫</div>
            <p className="photo-text">Profile photo</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form className="profile-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" value={profileData.fullName} className="form-input" readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={profileData.email} className="form-input" readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input type="text" value={profileData.subject} className="form-input" readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Staff Access</label>
              <input type="text" value={profileData.isStaff ? "Yes" : "No"} className="form-input" readOnly />
            </div>

            <div className="button-container">
              <button type="button" className="button-cancel">Cancel</button>
              <button type="button" className="button-submit">Edit Profile</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
