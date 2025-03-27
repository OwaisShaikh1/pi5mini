import React from 'react';
import '../styles/css/MyCourses.css'; // Ensure correct path

const MyCourses = () => {
  const categories = [
    { id: 1, name: "First Year Engineering (NEP - 2024-25)" },
    { id: 2, name: "First Year Engineering" },
    { id: 3, name: "Information Technology" },
    { id: 4, name: "Computer Engineering" },
    { id: 5, name: "Electronics and Telecommunication" },
    { id: 6, name: "Mechanical Engineering" },
    { id: 7, name: "Honors and Minors Courses" },
    { id: 8, name: "Institute Level Optional Course (ILOs)" }
  ];

  const handleCategoryClick = (category) => {
    console.log(`Selected category: ${category.name}`);
    // Add navigation logic here if needed
  };

  return (
    <div className="dbit-container fade-in">
      <h1 className="dbit-title">DBIT Course Categories</h1>
      
      <div className="categories-grid">
        {categories.map((category) => (
          <div 
            key={category.id}
            className="category-card"
            onClick={() => handleCategoryClick(category)}
          >
            <span className="category-name">{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCourses;
