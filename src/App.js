
import React, { createContext, useContext, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { Button, Input } from "@/components/ui/button";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({ code: "", client: "" });
  return (
    <AuthContext.Provider value={{ authData, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

const LoginPage = () => {
  const [apiKey, setApiKey] = useState("");
  const navigate = useNavigate();
  const handleLogin = () => {
    const flattradeAuthUrl = `https://auth.flattrade.in/api?api_key=${apiKey}`;
    window.location.href = flattradeAuthUrl;
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Flattrade API Login</h1>
      <Input
        type="text"
        placeholder="Enter API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        className="mb-4 p-2 w-full max-w-md rounded-lg border"
      />
      <Button onClick={handleLogin} className="w-full max-w-md">Login</Button>
    </div>
  );
};

const MainPage = () => {
  const { authData, setAuthData } = useAuth();
  const location = useLocation();
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const client = params.get("client");
    if (code && client) setAuthData({ code, client });
  }, [location.search, setAuthData]);
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Main Page - Flattrade Option Trading</h1>
      <div className="mt-4 p-4 rounded-lg bg-gray-100 shadow">
        <p><strong>Client ID:</strong> {authData.client}</p>
        <p><strong>Authorization Code:</strong> {authData.code}</p>
      </div>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
