import React, { createContext, useContext, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Paper,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import crypto from "crypto-js";
import config from "./config.json";
import ApiHandler from "./components/ApiHandler";
import Dashboard from "./components/Dashboard";

const AuthContext = createContext();

const ApiKeyPage = () => {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const navigate = useNavigate();

  const handleApiKeySubmit = () => {
    if (apiKeyInput) {
      localStorage.setItem("apiKey", apiKeyInput);
      navigate("/");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} className="p-6 mt-16">
        <Typography variant="h5" gutterBottom>
          Enter API Key
        </Typography>
        <TextField
          fullWidth
          label="API Key"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          variant="outlined"
          margin="normal"
        />
        <Button variant="contained" fullWidth onClick={handleApiKeySubmit}>
          Submit
        </Button>
      </Paper>
    </Container>
  );
};

const AuthHandler = ({ children }) => {
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
    const shaSecret = crypto
      .SHA256(key + code + config.api_secret)
      .toString();
    try {
      const response = await axios.post("/api/fetchToken", {
        api_key: key,
        request_code: code,
        api_secret: shaSecret,
      });
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
      }
    } catch (error) {
      console.error("Token fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ authDetails, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const AuthenticatedPage = () => {
  const { authDetails, loading } = useContext(AuthContext);

  return (
    <Container>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box className="mt-8">
          <Typography variant="h6">Code: {authDetails.code}</Typography>
          <Typography variant="h6">Client: {authDetails.client}</Typography>
          <ApiHandler />
          <Dashboard />
        </Box>
      )}
    </Container>
  );
};

export default function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Flattrade Option Trading App</Typography>
        </Toolbar>
      </AppBar>
      <AuthHandler>
        <Routes>
          <Route path="/api-key" element={<ApiKeyPage />} />
          <Route path="/" element={<AuthenticatedPage />} />
        </Routes>
      </AuthHandler>
    </Router>
  );
}
