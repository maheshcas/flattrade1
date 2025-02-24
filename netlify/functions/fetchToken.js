const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const { api_key, request_code, api_secret } = JSON.parse(event.body);
    const response = await fetch("https://authapi.flattrade.in/trade/apitoken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key, request_code, api_secret }),
    });
    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};