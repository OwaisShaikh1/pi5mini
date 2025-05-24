// src/components/ui/radio-group.js
import React from "react";

export const RadioGroup = ({ value, onValueChange, children }) => {
  return (
    <div className="space-y-2">
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, { value, onValueChange });
      })}
    </div>
  );
};

export const RadioGroupItem = ({ value, id, onValueChange, children }) => {
  return (
    <div
      onClick={() => onValueChange(value)}
      className={`cursor-pointer p-2 border rounded-lg hover:bg-gray-100 transition-colors duration-300 ${
        value === children ? "bg-gray-100" : ""
      }`}
    >
      <input
        type="radio"
        id={id}
        value={value}
        onChange={() => {}}
        checked={value === children}
        className="hidden"
      />
      <label htmlFor={id} className="text-lg font-medium">
        {children}
      </label>
    </div>
  );
};
