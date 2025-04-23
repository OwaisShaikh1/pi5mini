import React from "react";

export const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
};
