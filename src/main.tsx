import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, {
        scope: import.meta.env.BASE_URL
      })
      .then((registration) => {
        console.log(
          "Service Worker registered:",
          registration.scope
        );
      })
      .catch((error: Error) => {
        console.error(
          "Service Worker registration failed:",
          error
        );
      });
  });
}
