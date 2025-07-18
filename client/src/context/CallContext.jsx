import { createContext, useContext } from "react";

const CallContext = createContext();
export const useCallContext = () => useContext(CallContext);
