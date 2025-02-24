import React from "react";

export default function Header({ niftyPrice }) {
  return (
    <header className="bg-blue-600 text-white p-4 text-center shadow-lg">
      <h1 className="text-2xl font-bold">Option Trading Platform</h1>
      <p>Nifty 50 Strike Price: {niftyPrice || "Loading..."}</p>
    </header>
  );
}