const axios = require("axios");
const crypto = require("crypto");

exports.handler = async (event) => {
  try {
    const { api_key, request_code, api_secret } = JSON.parse(event.body);
    const hashedSecret = crypto.createHash("sha256").update(api_secret).digest("hex");
    const response = await axios.post("https://authapi.flattrade.in/trade/apitoken", {
      api_key,
      request_code,
      api_secret: hashedSecret,
    });
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};