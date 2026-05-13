import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

// IMPORTANTE: Adiciona VITE_GOOGLE_CLIENT_ID no teu ficheiro .env na pasta client
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "COLA_AQUI_O_TEU_CLIENT_ID";

console.log('%c⚽ BOLA NA ZONA - VERSÃO 1.1.0 (GOOGLE AUTH FIX)', 'background: #00C853; color: white; font-size: 16px; padding: 10px; border-radius: 5px; font-weight: bold;');
console.log('📡 [VITE] GOOGLE ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID ? '✅ Configurado' : '❌ EM FALTA');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
