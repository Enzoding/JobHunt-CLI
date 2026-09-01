import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@appica/ui-react/providers/theme-provider';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" enableSystem>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
