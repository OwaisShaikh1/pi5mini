// components/ui/Dropdown.js
import React from "react";

const Dropdown = ({ label, options, value, onChange }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-gray-700 font-medium mb-1">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
