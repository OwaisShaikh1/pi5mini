import React from "react";

export const Label = ({ children, className = "", ...props }) => {
  return (
    <label className={`text-sm font-medium text-gray-700 ${className}`} {...props}>
      {children}
    </label>
  );
};
