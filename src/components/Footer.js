import React from "react";

export default function Footer({ currentTime }) {
  return (
    <footer className="bg-gray-800 text-white p-2 text-center">
      <p>IST Time: {currentTime}</p>
    </footer>
  );
}