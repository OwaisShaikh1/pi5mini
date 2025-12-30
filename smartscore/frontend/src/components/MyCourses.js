import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/css/MyCourses.css";

const MyCourses = () => {
  const [mysubjects, setmysubjects] = useState({ subjects: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const navigate = useNavigate();

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
      url = "http://localhost:8000/api/getsubjects?type=student";
      type = "student";
    } else if (teacherCode) {
      url = "http://localhost:8000/api/getsubjects?type=teacher";
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
        setError(response.status === 401 ? "Unauthorized: Invalid or expired token." : "Unable to fetch subjects.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setUserType(type);
      setmysubjects({ subjects: Array.isArray(data.subjects) ? data.subjects : [] });
      setError(null);
    } catch (err) {
      setError("Failed to fetch subjects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchsubjects();
  }, []);

  const filteredSubjects = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();
    return mysubjects.subjects.filter((subject) => {
      const matchesSearch = !normalizedSearch ||
        subject.name?.toLowerCase().includes(normalizedSearch) ||
        subject.code?.toLowerCase().includes(normalizedSearch);
      const matchesBranch = branchFilter === "All" || subject.branch === branchFilter;
      return matchesSearch && matchesBranch;
    });
  }, [mysubjects.subjects, searchTerm, branchFilter]);

  useEffect(() => {
    if (!selectedSubject && filteredSubjects.length > 0) {
      setSelectedSubject(filteredSubjects[0]);
    }
  }, [filteredSubjects, selectedSubject]);

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    localStorage.setItem("activeSubjectCode", subject.code || "");
    localStorage.setItem("activeSubjectName", subject.name || "");
  };

  const handlePrimaryAction = () => {
    if (!selectedSubject) return;
    // Persist selection so downstream pages can pick it up
    localStorage.setItem("activeSubjectCode", selectedSubject.code || "");
    localStorage.setItem("activeSubjectName", selectedSubject.name || "");

    if (userType === "teacher") {
      navigate("/createquiz");
    } else {
      navigate("/dashboard?section=StudentQuizzes");
    }
  };

  const branches = useMemo(() => {
    const items = mysubjects.subjects
      .map((s) => s.branch)
      .filter(Boolean);
    return ["All", ...Array.from(new Set(items))];
  }, [mysubjects.subjects]);

  return (
    <div className="courses-shell fade-in">
      <div className="courses-header">
        <div>
          <p className="eyebrow">{userType ? `${userType.charAt(0).toUpperCase()}${userType.slice(1)} view` : "Courses"}</p>
          <h1 className="dbit-title">My Courses</h1>
          <p className="subtitle">Stay on top of every subject you are enrolled in and jump straight into quizzes or course planning.</p>
          <div className="chips-row">
            <span className="chip">{mysubjects.subjects.length} total</span>
            <span className="chip chip-soft">{filteredSubjects.length} visible</span>
          </div>
        </div>
        <div className="summary-card">
          <p className="summary-label">Active subjects</p>
          <h2 className="summary-value">{filteredSubjects.length}</h2>
          <p className="summary-subtext">Filtered by your search and branch</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="input-group-inline">
          <input
            type="search"
            placeholder="Search by subject name or code"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
            {branches.map((branch) => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>
        <button className="cta ghost" onClick={fetchsubjects} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="courses-layout">
        <div className="categories-grid">
          {loading &&
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className="category-card skeleton" />
            ))}

          {!loading && filteredSubjects.map((subject, index) => (
            <button
              key={subject.code || subject.id || index}
              className={`category-card ${selectedSubject?.code === subject.code ? "active" : ""}`}
              onClick={() => handleSubjectClick(subject)}
              type="button"
            >
              <div className="card-header">
                <span className="pill">{subject.code || "Code"}</span>
                <span className="pill soft">{subject.branch || "Branch"}</span>
              </div>
              <span className="category-name">{subject.name}</span>
              <p className="card-subtext">Tap to view details and actions</p>
            </button>
          ))}

          {!loading && filteredSubjects.length === 0 && (
            <div className="empty-state">
              <p>No subjects match your filters.</p>
              <p className="muted">Try clearing the search or switching branches.</p>
            </div>
          )}
        </div>

        <aside className="course-detail">
          {selectedSubject ? (
            <>
              <p className="eyebrow">Selected subject</p>
              <h3>{selectedSubject.name}</h3>
              <ul className="detail-list">
                <li><span>Code</span><span>{selectedSubject.code || "—"}</span></li>
                <li><span>Branch</span><span>{selectedSubject.branch || "—"}</span></li>
                <li><span>Role</span><span>{userType ? userType : "—"}</span></li>
              </ul>
              <div className="cta-row">
                <button className="cta primary" onClick={handlePrimaryAction}>
                  {userType === "teacher" ? "Create a quiz" : "View available quizzes"}
                </button>
                <button className="cta ghost" onClick={() => setSelectedSubject(null)}>Clear selection</button>
              </div>
            </>
          ) : (
            <div className="empty-detail">
              <p>Select a subject to view its details.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default MyCourses;
