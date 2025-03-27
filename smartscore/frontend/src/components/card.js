// components/ui/Card.js
import React from "react";

const Card = ({ image, title, description, link }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
        {link && (
          <a href={link} className="text-blue-500 hover:underline mt-2 block">
            Learn More
          </a>
        )}
      </div>
    </div>
  );
};

export default Card;
