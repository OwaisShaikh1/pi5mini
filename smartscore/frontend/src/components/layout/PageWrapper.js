import React from "react";
import Sidebar from "./Sidebar";

const PageWrapper = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default PageWrapper;
