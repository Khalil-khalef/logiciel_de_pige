import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './index.css';

// Appliquer des styles de base
const style = document.createElement('style');
style.textContent = `
  :root {
    --background-primary: #0D1B2A;
    --background-secondary: #11233B;
    --background-card: #13293D;
    --text-primary: #FFFFFF;
    --text-secondary: #A3B9CC;
    --accent-primary: #28E0B8;
    --accent-secondary: #1BC29D;
    --border-light: #1E3A5F;
  }
  
  body {
    @apply bg-background-primary text-text-primary font-sans antialiased;
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }
  
  * {
    box-sizing: border-box;
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
