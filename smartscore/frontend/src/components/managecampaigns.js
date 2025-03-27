// components/admin/ManageCampaigns.js
import React, { useState } from "react";
import InputField from "../ui/InputField";
import Button from "../ui/Button";

const ManageCampaigns = () => {
  const [campaign, setCampaign] = useState({ title: "", description: "" });

  const handleChange = (e) => {
    setCampaign({ ...campaign, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Manage Campaigns</h2>

      <InputField label="Campaign Title" name="title" value={campaign.title} onChange={handleChange} />
      <InputField label="Description" name="description" value={campaign.description} onChange={handleChange} />

      <Button variant="primary" className="mt-4">Save Campaign</Button>
    </div>
  );
};

export default ManageCampaigns;
