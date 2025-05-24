import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/css/Profile.css";

const Profile = () => {
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null); // "student" or "teacher"
  const navigate=useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const studentCode = localStorage.getItem("studentcode");
      const teacherCode = localStorage.getItem("teachercode");
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Missing authentication token.");
        setLoading(false);
        return;
      }

      let url = "";
      let type = "";

      if (studentCode) {
        url = `http://localhost:8000/api/student/${studentCode}/profile/`;
        type = "student";
      } else if (teacherCode) {
        url = `http://localhost:8000/api/teacher/${teacherCode}/profile/`;
        type = "teacher";
      } else {
        setError("Missing student or teacher credentials.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

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

        setUserType(type); // Set user type once data is confirmed

        setProfileData(
          type === "student"
            ? {
                fullName: data.name || "N/A",
                email: data.email || "N/A",
                department: data.branch || "N/A",
                year: data.average_score !== undefined ? data.average_score : "N/A",
              }
            : {
                fullName: data.name || "N/A",
                email: data.email || "N/A",
                subjects: Array.isArray(data.subjects) ? data.subjects : [], // Ensure it's an array
                isStaff: data.is_staff || false,
              }
        );
        
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

  if (loading) return <div className="profile-page">Loading profile...</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Sidebar */}
        <div className="sidebar">
          <h2 className="sidebar-title">{userType === "teacher" ? "Teacher Profile" : "Student Profile"}</h2>
          <ul className="sidebar-list">
            <li className="sidebar-item">🔒 Password</li>
            {userType === "teacher" ? (
              <>
                <li className="sidebar-item">📂 Manage Classes</li>
                <li className="sidebar-item">📊 View Reports</li>
                <li className="sidebar-item">🔌 Plugins</li>
              </>
            ) : (
              <>
                <li className="sidebar-item">🔔 Notifications <span className="notification-badge">9</span></li>
                <li className="sidebar-item">📂 Export Data</li>
                <li className="sidebar-item">🔌 Plugins</li>
                <li className="sidebar-item">📝 Save Test History</li>
              </>
            )}
          </ul>
          <div className="delete-account">🗑 Delete Your Account</div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <h1 className="page-title">{userType === "teacher" ? "Teacher Profile" : "Student Profile"}</h1>

          <div className="profile-photo-container">
            <div className="profile-photo">{userType === "teacher" ? "👨‍🏫" : "👤"}</div>
            <p className="photo-text">Profile Photo</p>
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

            {userType === "teacher" ? (
              <>
                <div className="form-group">
                  <label className="form-label">Subjects</label>
                  {Array.isArray(profileData.subjects) && profileData.subjects.length > 0 ? (
                    <ul className="subject-list">
                      {profileData.subjects.map((subject) => (
                        <li key={subject.id} className="subject-item">{subject.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="subject-text">No subjects available</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Staff Access</label>
                  <input type="text" value={profileData.isStaff ? "Yes" : "No"} className="form-input" readOnly />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input type="text" value={profileData.department} className="form-input" readOnly />
                </div>

                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input type="text" value={profileData.year} className="form-input" readOnly />
                </div>
              </>
            )}

            <div className="button-container">
              <button type="button" onClick={() => {
                if (userType === "student") {
                  navigate("/dashboard");
                } else if (userType === "teacher") {
                  navigate("/teacher");
                }
              }} className="button-cancel">Return</button>
              <button type="button" onClick={() => alert("Feature coming soon!")} className="button-submit" >Edit Profile</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
