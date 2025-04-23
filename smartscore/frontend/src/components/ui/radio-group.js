import React from "react";

export const RadioGroup = ({ options, name, onChange, selected }) => {
  return (
    <div className="flex flex-col space-y-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-2">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={selected === option.value}
            onChange={onChange}
            className="h-4 w-4 text-blue-500"
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
};
