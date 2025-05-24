// src/components/ui/alert-dialog.js
import React from "react";

export const AlertDialog = ({ open, onOpenChange, children, hideClose = false }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        {children}
        {!hideClose && (
          <button
            onClick={() => onOpenChange(false)}
            className="mt-4 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};


export const AlertDialogContent = ({ children }) => {
  return <div>{children}</div>;
};

export const AlertDialogHeader = ({ children }) => {
  return <div className="text-xl font-bold mb-2">{children}</div>;
};

export const AlertDialogTitle = ({ children }) => {
  return <div className="text-lg font-semibold">{children}</div>;
};

export const AlertDialogDescription = ({ children }) => {
  return <div className="text-gray-700 mb-4">{children}</div>;
};

export const AlertDialogFooter = ({ children }) => {
  return <div className="flex justify-end">{children}</div>;
};

export const AlertDialogAction = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
    >
      {children}
    </button>
  );
};

export const AlertDialogCancel = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
    >
      {children}
    </button>
  );
};
