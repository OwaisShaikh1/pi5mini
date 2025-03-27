// components/auth/ForgotPassword.js
import React, { useState } from "react";
import InputField from "../ui/InputField";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { resetPassword } = useAuth();

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      alert("Password reset link sent to your email!");
    } catch (error) {
      console.error("Reset failed", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
      <form onSubmit={handleReset}>
        <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Button type="submit" variant="primary">Reset Password</Button>
      </form>
      <p className="mt-4 text-sm">
        Back to <a href="/login" className="text-blue-500">Login</a>
      </p>
    </div>
  );
};

export default ForgotPassword;
