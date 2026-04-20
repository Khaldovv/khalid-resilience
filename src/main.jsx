import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// ── Sentry (optional) ─────────────────────────────────────────────────────────
// Sentry is loaded via CDN only when VITE_SENTRY_DSN is configured.
// This avoids bundling @sentry/react and breaking builds when it's not installed.
;(function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;
  const script = document.createElement('script');
  script.src = 'https://browser.sentry-cdn.com/8.0.0/bundle.min.js';
  script.crossOrigin = 'anonymous';
  script.onload = () => {
    if (window.Sentry) {
      window.Sentry.init({ dsn, environment: import.meta.env.MODE, tracesSampleRate: 0.1 });
    }
  };
  document.head.appendChild(script);
})();


import { AppProvider } from './context/AppContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './components/ToastProvider.jsx'
import { BIAProvider } from './context/BIAContext.jsx'
import { SumoodProvider } from './context/SumoodContext.jsx'
import { BIAAssetProvider } from './context/BIAAssetContext.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <AuthProvider>
          <ToastProvider>
            <BIAProvider>
              <BIAAssetProvider>
                <SumoodProvider>
                  <App />
                </SumoodProvider>
              </BIAAssetProvider>
            </BIAProvider>
          </ToastProvider>
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
