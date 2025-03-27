import React from "react";

const NotFoundPage = () => {
  return (
    <div className="text-center p-10">
      <h1 className="text-3xl font-bold text-red-500">404</h1>
      <p className="text-lg">Oops! Page not found.</p>
      <a href="/" className="text-blue-500">Go back home</a>
    </div>
  );
};

export default NotFoundPage;
