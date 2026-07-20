import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [token, setToken] = useState("");
  // FIX: localStorage stores strings — "true" is truthy but !== true
  // So we parse it properly as a boolean
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedAdmin = localStorage.getItem("admin");
    if (savedToken) setToken(savedToken);
    // FIX: convert string "true" → boolean true
    if (savedAdmin === "true") setAdmin(true);
  }, []);

  const contextValue = { token, setToken, admin, setAdmin };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
