import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <Link to="/" className="text-blue-600 text-xl font-bold">CARE CONNECT</Link>
      <div className="space-x-4">
        <Link to="/dashboard" className="text-gray-700 hover:text-blue-500">Dashboard</Link>
        <Link to="/donate" className="text-gray-700 hover:text-blue-500">Donate</Link>
        <Link to="/help" className="text-gray-700 hover:text-blue-500">Help</Link>
      </div>
    </nav>
  );
};

export default Navbar;
