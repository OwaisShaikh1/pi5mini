import React, { useState } from "react";

export default function ChangePassword(){
    const [formData, setFormData]  = useState({
        old_password: "",
        new_password: "",
        confirm_new_password: "",
    });

    const [message, setMessage] = useState("");
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

     const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.new_password !== formData.confirm_password) {
            setMessage("New passwords do not match.");
            return;
        }
     }

     try{
        const response = fetch("http://127.0.0.1:8000/api/changepassword/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        })

        const data= response.json();

        if (response.ok){
            setMessage("Password changed successfully!")
        } else {
            setMessage(data.error || "Error changing password.");
        }
     } catch (err) {
        setMessage("Server Error");
     }

    return(
        <form onSubmit={handleSubmit}>
            <h2>Change Password</h2>
            <label>
                Current Password:
                <input type="password" name="old_password" onChange={handleChange} required/>
            </label>
            <label>
                New Password:
                <input type="password" name="new_password" onChange={handleChange} required/>
            </label>
            <label>
                Confirm New Password:
                <input type="password" name="confirm_new_password" onChange={handleChange} required/>
            </label>

            <button type="submit">Update password</button>

            {message && <p>{message}</p>}
        </form>
    )
};