// components/dashboard/DonationHistory.js
import React from "react";

const donations = [
  { id: 1, amount: "$50", date: "Jan 12, 2025", method: "Credit Card" },
  { id: 2, amount: "$25", date: "Feb 5, 2025", method: "PayPal" },
  { id: 3, amount: "$100", date: "Mar 8, 2025", method: "Credit Card" },
];

const DonationHistory = () => {
  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Donation History</h2>

      <ul className="divide-y">
        {donations.map((donation) => (
          <li key={donation.id} className="py-2 flex justify-between">
            <span>{donation.date}</span>
            <span className="font-bold">{donation.amount}</span>
            <span className="text-gray-500">{donation.method}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DonationHistory;
