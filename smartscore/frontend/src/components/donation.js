import React, { useState } from "react";
import Button from "./button";

const DonationOptions = () => {
  const [amount, setAmount] = useState(10);

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-lg font-bold">Donation Options</h2>
      <div className="flex gap-4 mt-2">
        {[10, 25, 50, 100].map((amt) => (
          <button
            key={amt}
            className={`p-2 border rounded ${amount === amt ? "bg-blue-500 text-white" : ""}`}
            onClick={() => setAmount(amt)}
          >
            ${amt}
          </button>
        ))}
        <input
          type="number"
          placeholder="Custom"
          className="p-2 border rounded"
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <Button text="Donate Now" variant="primary" className="mt-4" />
    </div>
  );
};

export default DonationOptions;
