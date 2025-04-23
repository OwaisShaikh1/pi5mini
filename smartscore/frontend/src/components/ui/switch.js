import React, { useState } from "react";

export const Switch = ({ checked, onChange }) => {
  return (
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      <div
        className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 ${
          checked ? "bg-blue-500" : ""
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        ></div>
      </div>
    </label>
  );
};
