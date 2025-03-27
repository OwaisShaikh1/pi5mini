import React from "react";
import AdminDashboard from "../components/admin/AdminDashboard";
import ManageUsers from "../components/admin/ManageUsers";
import ManageDonations from "../components/admin/ManageDonations";

const AdminDashboardPage = () => {
  return (
    <div>
      <AdminDashboard />
      <ManageUsers />
      <ManageDonations />
    </div>
  );
};

export default AdminDashboardPage;
