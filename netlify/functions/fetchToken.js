// netlify/functions/fetchToken.js

import fetch from "node-fetch";
import crypto from "crypto";

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
      };
    }

    const { api_key, request_code, api_secret } = JSON.parse(event.body);

    if (!api_key || !request_code || !api_secret) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required parameters" }),
      };
    }

    const hashedSecret = crypto.createHash("sha256").update(api_secret).digest("hex");

    const response = await fetch("https://authapi.flattrade.in/trade/apitoken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key,
        request_code,
        api_secret: hashedSecret,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: data.message || "Token fetch failed" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
}
