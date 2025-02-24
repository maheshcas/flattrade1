import React, { useState } from "react";
import { useToken } from "../context/TokenContext";
import { callMultipleAPIs } from "../api/apiService";

export default function Dashboard() {
  const { token, refreshTokenUrl } = useToken();
  const [apiResults, setApiResults] = useState([]);

  const handleApiCalls = async () => {
    const endpoints = ["/endpoint1", "/endpoint2", "/endpoint3"];
    try {
      const results = await callMultipleAPIs(token, endpoints, refreshTokenUrl);
      setApiResults(results);
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <button onClick={handleApiCalls} className="bg-blue-500 text-white p-2 rounded-lg mt-4">Fetch Data</button>
      <div className="mt-4">
        {apiResults.map((result, index) => (
          <pre key={index} className="bg-gray-100 p-2 rounded-lg">{JSON.stringify(result, null, 2)}</pre>
        ))}
      </div>
    </div>
  );
}