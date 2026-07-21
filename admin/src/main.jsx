import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import { AuthContextProvider } from "./context/authContext.jsx";
import { DarkModeContextProvider } from "./context/darkModeContext.jsx";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <DarkModeContextProvider>
        <AuthContextProvider>
          <App />
        </AuthContextProvider>
      </DarkModeContextProvider>
    </QueryClientProvider>
  </StrictMode>
)
