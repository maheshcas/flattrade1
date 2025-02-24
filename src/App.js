import React, { useState, useEffect } from "react";
import ApiHandler from "./components/ApiHandler";
import Dashboard from "./components/Dashboard";
import { useNavigate } from "react-router-dom";

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("apiKey") || "");
  const [authDetails, setAuthDetails] = useState({ code: null, client: null });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const flattradeAuthUrl = `https://auth.flattrade.in/?app_key=${apiKey}`;

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("code");
    const client = queryParams.get("client");

    if (code && client) {
      setAuthDetails({ code, client });
      localStorage.setItem("code", code);
      localStorage.setItem("client", client);
      fetchToken(apiKey, code);
    } else if (!apiKey) {
      navigate("/api-key");
    } else {
      window.location.href = flattradeAuthUrl;
    }
  }, [apiKey]);

  const fetchToken = async (key, code) => {
    setLoading(true);
    const crypto = await import("crypto-js");
    const shaSecret = crypto
      .SHA256(key + code + "2025.8199821099b74d748969f3143d73a3b1481bebed356ccf4d")
      .toString();
    try {
      const response = await fetch("/.netlify/functions/fetchToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: key, request_code: code, api_secret: shaSecret }),
      });
      const data = await response.json();
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
    } catch (error) {
      console.error("Token fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow p-4">
        {loading ? (
          <p>Loading authentication data...</p>
        ) : authDetails.code && authDetails.client ? (
          <>
            <h2 className="text-xl font-bold mb-4">Authentication Details</h2>
            <p>Code: {authDetails.code}</p>
            <p>Client: {authDetails.client}</p>
            <ApiHandler />
            <Dashboard />
          </>
        ) : (
          <p>Redirecting to authentication...</p>
        )}
      </main>
    </div>
  );
}
