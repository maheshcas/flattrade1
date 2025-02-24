import React, { useEffect } from "react";

export default function ApiHandler({ apiEndpoints }) {
  useEffect(() => {
    const fetchData = async () => {
      for (const endpoint of apiEndpoints) {
        try {
          const response = await fetch(endpoint);
          const data = await response.json();
          console.log(`Data from ${endpoint}:`, data);
        } catch (error) {
          console.error(`Error fetching from ${endpoint}:`, error);
        }
      }
    };
    fetchData();
  }, [apiEndpoints]);

  return <p>Fetching market data...</p>;
}