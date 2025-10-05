import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './config/i18n';
import SignIn from './screens/signin';
import { useTheme } from './hooks/useTheme';

const value = { ripple: true, unstyled: false };

function App() {
  const { theme, setTheme } = useTheme();

  return (
    <PrimeReactProvider value={value}>
      <SignIn theme={theme} setTheme={setTheme} />
    </PrimeReactProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);