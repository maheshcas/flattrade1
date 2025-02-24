const axios = require("axios");

exports.handler = async (event) => {
  try {
    let { token, endpoints, refreshTokenFunction } = JSON.parse(event.body);

    const apiCalls = endpoints.map((url) =>
      axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
    );

    let results;
    try {
      results = await Promise.all(apiCalls);
    } catch (error) {
      if (error.response?.status === 401 && refreshTokenFunction) {
        const refreshResponse = await axios.post(refreshTokenFunction);
        token = refreshResponse.data.token;
        results = await Promise.all(
          endpoints.map((url) =>
            axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
          )
        );
      } else {
        throw error;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(results.map((res) => res.data)),
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};