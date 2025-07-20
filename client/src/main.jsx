import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ApiProvider } from "./context/ApiContext";
import { SocketProvider } from './context/SocketProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApiProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </ApiProvider>
  </StrictMode>,
)
