// components/admin/SiteSettings.js
import React, { useState } from "react";
import Button from "../ui/Button";

const SiteSettings = () => {
  const [settings, setSettings] = useState({ supportEmail: "support@careconnect.com" });

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Site Settings</h2>

      <label className="block text-sm font-medium mb-2">Support Email</label>
      <input
        type="email"
        name="supportEmail"
        value={settings.supportEmail}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <Button variant="primary" className="mt-4">Save Settings</Button>
    </div>
  );
};

export default SiteSettings;
