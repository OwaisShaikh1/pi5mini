import React, { useEffect, useState } from 'react';
import '../styles/css/MyCourses.css'; // Ensure correct path

const MyCourses = () => {
  const [mysubjects, setmysubjects] = useState({ subjects: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const fetchsubjects = async () => {
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
        url = `http://localhost:8000/api/getsubjects?type=student`;
        type = "student";
      } else if (teacherCode) {
        url = `http://localhost:8000/api/getsubjects?type=teacher`;
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
            setError(`Unauthorized: Invalid or expired token.`);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Received subjects data:", data); // ✅ print data

        setUserType(type);

        setmysubjects({
          subjects: Array.isArray(data.subjects) ? data.subjects : [],
        });

        setError(null);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch subjects.");
      } finally {
        setLoading(false);
      }
    };

    fetchsubjects();
  }, []);

  const handleSubjectClick = (subject) => {
    console.log(`Selected subject: ${subject.name}`);
    // You can navigate or handle logic here
  };

  return (
    <div className="dbit-container fade-in">
      <h1 className="dbit-title">My Courses</h1>

      {loading ? (
        <p>Loading subjects...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <div className="categories-grid">
          {mysubjects.subjects.map((subject, index) => (
            <div
              key={subject.id || index}
              className="category-card"
              onClick={() => handleSubjectClick(subject)}
            >
              <span className="category-name">{subject.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
