import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import ApiHandler from "./components/ApiHandler";
import { useNavigate } from "react-router-dom";

export default function App() {
  const [niftyPrice, setNiftyPrice] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [apiKey, setApiKey] = useState(localStorage.getItem("apiKey") || "");
  const [authDetails, setAuthDetails] = useState({ code: null, client: null });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const flattradeAuthUrl = `https://auth.flattrade.in/?app_key=${apiKey}`;
  const apiEndpoints = ["https://pi.flattrade.in/api/v1/marketdata/nifty50"];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
        fetchNiftyPrice();
      }
    } catch (error) {
      console.error("Token fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNiftyPrice = async () => {
    try {
      const response = await fetch(apiEndpoints[0]);
      const data = await response.json();
      setNiftyPrice(data?.strikePrice || "Unavailable");
    } catch (error) {
      console.error("Error fetching Nifty 50 price:", error);
    }
  };

  useEffect(() => {
    if (authDetails.code && authDetails.client) {
      fetchNiftyPrice();
      const interval = setInterval(fetchNiftyPrice, 5000);
      return () => clearInterval(interval);
    }
  }, [authDetails]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header niftyPrice={niftyPrice} />
      <main className="flex-grow p-4">
        {loading ? (
          <p>Loading authentication and market data...</p>
        ) : (
          authDetails.code && authDetails.client ? (
            <>
              <h2 className="text-xl font-bold mb-4">Authentication Details</h2>
              <p>Code: {authDetails.code}</p>
              <p>Client: {authDetails.client}</p>
              <ApiHandler apiEndpoints={apiEndpoints} />
              <Dashboard />
            </>
          ) : (
            <p>Redirecting to authentication...</p>
          )
        )}
      </main>
      <Footer
        currentTime={currentTime.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        })}
      />
    </div>
  );
}