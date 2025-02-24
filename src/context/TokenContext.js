import { createContext, useContext, useState } from "react";

const TokenContext = createContext();

export const TokenProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [refreshTokenUrl, setRefreshTokenUrl] = useState(null);

  return (
    <TokenContext.Provider value={{ token, setToken, refreshTokenUrl, setRefreshTokenUrl }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => useContext(TokenContext);