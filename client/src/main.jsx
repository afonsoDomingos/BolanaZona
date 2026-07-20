import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

// Prevenção do erro da "Tela Branca" (ChunkLoadError) após novas publicações na Vercel
window.addEventListener('error', (e) => {
  if (
    e.message && 
    (e.message.includes('Failed to fetch dynamically imported module') || e.message.includes('Importing a module script failed'))
  ) {
    console.warn('Nova versão detetada ou erro ao carregar módulo. A recarregar a página...');
    // Se ainda não recarregou recentemente, recarrega para ir buscar o novo código à Vercel
    if (!sessionStorage.getItem('reloading_due_to_chunk_error')) {
      sessionStorage.setItem('reloading_due_to_chunk_error', 'true');
      window.location.reload();
    }
  }
});

// Remover o Service Worker antigo para impedir que o site fique encravado no cache
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('✅ [PWA] Service Worker antigo desinstalado para evitar bugs de cache.');
    }
  });
}

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
