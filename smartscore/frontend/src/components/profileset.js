// components/dashboard/ProfileSettings.js
import React, { useState } from "react";
import InputField from "../ui/InputField";
import Button from "../ui/Button";

const ProfileSettings = () => {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 234 567 890",
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>

      <InputField label="Full Name" name="name" value={profile.name} onChange={handleChange} />
      <InputField label="Email Address" name="email" type="email" value={profile.email} onChange={handleChange} />
      <InputField label="Phone Number" name="phone" type="tel" value={profile.phone} onChange={handleChange} />

      <Button variant="primary" className="mt-4">Save Changes</Button>
    </div>
  );
};

export default ProfileSettings;
