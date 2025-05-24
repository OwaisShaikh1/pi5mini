// src/components/ui/checkbox.js
import React from "react";

export const Checkbox = ({ id, checked, onCheckedChange, children }) => {
  return (
    <div
      onClick={() => onCheckedChange(!checked)}
      className={`cursor-pointer flex items-center p-2 border rounded-lg hover:bg-gray-100 transition-colors duration-300 ${
        checked ? "bg-gray-100" : ""
      }`}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={() => {}}
        className="mr-3"
      />
      <label htmlFor={id} className="text-lg font-medium">
        {children}
      </label>
    </div>
  );
};
