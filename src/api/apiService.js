import axios from "axios";

export const fetchToken = async (apiKey, requestCode, apiSecret) => {
  const response = await axios.post("/api/fetchToken", { api_key: apiKey, request_code: requestCode, api_secret: apiSecret });
  return response.data;
};

export const callMultipleAPIs = async (token, endpoints, refreshTokenFunction) => {
  const response = await axios.post("/api/callApi", { token, endpoints, refreshTokenFunction });
  return response.data;
};