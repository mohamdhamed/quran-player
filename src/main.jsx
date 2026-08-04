import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { dropLegacyAudioCache } from './services/audioCacheCleanup';
import './styles/globals.css';
import './styles/accessibility.css';

// الأجهزة اللي شغّلت النسخ القديمة ممكن يكون عندها كاش صوت باظ
// بيمنع التلاوة من الاشتغال - بيتمسح مرة واحدة وخلاص
dropLegacyAudioCache();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
