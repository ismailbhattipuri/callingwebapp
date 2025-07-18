import React, { createContext, useContext } from "react";

// Create the context
const ApiContext = createContext();

// Create the provider
export const ApiProvider = ({ children }) => {
  const baseURL = import.meta.env.VITE_BASE_URL;

  return (
    <ApiContext.Provider value={{ baseURL }}>
      {children}
    </ApiContext.Provider>
  );
};

// Custom hook to use the context
export const useApi = () => useContext(ApiContext);
