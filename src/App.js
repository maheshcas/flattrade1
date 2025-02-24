import React, { createContext, useContext, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
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

const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(
    () =>
      JSON.parse(localStorage.getItem("authData")) || {
        code: "",
        client: "",
        apiKey: config.defaultApiKey || "",
        token: "",
        status: "",
      }
  );
  useEffect(() => {
    localStorage.setItem("authData", JSON.stringify(authData));
  }, [authData]);
  return (
    <AuthContext.Provider value={{ authData, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};
const useAuth = () => useContext(AuthContext);

const Header = () => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6">Flattrade Option Trading App</Typography>
    </Toolbar>
  </AppBar>
);

const Footer = () => (
  <Box
    component="footer"
    sx={{ p: 2, backgroundColor: "#f5f5f5", textAlign: "center" }}
  >
    <Typography variant="body2">
      © 2025 Flattrade Option Trading App. All rights reserved.
    </Typography>
  </Box>
);

const RightPanel = () => (
  <Paper sx={{ p: 2, height: "100%", backgroundColor: "#fafafa" }}>
    <Typography variant="h6">Right Panel</Typography>
    <Typography variant="body2">
      Future enhancements like option chain data will appear here.
    </Typography>
  </Paper>
);

const ApiKeyPage = () => {
  const { setAuthData } = useAuth();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setAuthData((prev) => ({ ...prev, apiKey }));
      localStorage.setItem("apiKey", apiKey);
      window.location.href = `${config.authUrl}?app_key=${apiKey}`;
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        Enter API Key
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="API Key"
          variant="outlined"
          fullWidth
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" type="submit" fullWidth>
          Proceed to Authentication
        </Button>
      </form>
    </Container>
  );
};

const MainPage = () => {
  const { authData, setAuthData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async (apiKey, code) => {
      try {
        setAuthData((prev) => ({ ...prev, status: "Fetching token..." }));
        const apiSecretInput = crypto
          .SHA256(`${apiKey}${code}${config.apiSecret}`)
          .toString();
        const response = await axios.post(
  "/api/fetchToken",
  {
    api_key: apiKey,
    request_code: code,
    api_secret: apiSecretInput,
  }
);
        setAuthData((prev) => ({
          ...prev,
          token: response.data.token,
          status: "Token fetched successfully",
        }));
      } catch (error) {
        setAuthData((prev) => ({
          ...prev,
          status: `Token fetch failed: ${error.message}`,
        }));
      } finally {
        setLoading(false);
      }
    };

    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const client = params.get("client");
    const apiKey = localStorage.getItem("apiKey") || authData.apiKey;

    if (code && client && apiKey) {
      setAuthData((prev) => ({ ...prev, code, client, apiKey }));
      fetchToken(apiKey, code);
    } else if (!apiKey) {
      navigate("/");
    } else {
      setLoading(false);
    }
  }, [location.search, navigate, setAuthData, authData.apiKey]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6">Fetching token, please wait...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header />
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Container maxWidth="md" sx={{ flex: 3, p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Main Content
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
            <Typography variant="body1">
              <strong>API Key:</strong> {authData.apiKey}
            </Typography>
            <Typography variant="body1">
              <strong>Client ID:</strong> {authData.client}
            </Typography>
            <Typography variant="body1">
              <strong>Authorization Code:</strong> {authData.code}
            </Typography>
            <Typography variant="body1">
              <strong>Token:</strong> {authData.token}
            </Typography>
            <Typography variant="body1">
              <strong>Status:</strong> {authData.status}
            </Typography>
          </Paper>
        </Container>
        <Box sx={{ width: 300, p: 2, borderLeft: "1px solid #ddd" }}>
          <RightPanel />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const apiKey = localStorage.getItem("apiKey");
    if (params.get("code") && params.get("client") && apiKey) {
      navigate("/main" + location.search, { replace: true });
    }
  }, [location, navigate]);

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<ApiKeyPage />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </AuthProvider>
  );
};

export default function RootApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
