import { PrimeReactProvider } from "primereact/api";
import { useTheme } from "./hooks/useTheme";
import SignIn from "./screens/signin";
import ForgotPassword from "./screens/ForgotPassword";
import { Routes, Route } from "react-router-dom";

export default function App() {
  const { theme, setTheme } = useTheme();
  const value = { ripple: true, unstyled: false };

  return (
    <PrimeReactProvider value={value}>
      <Routes>
        <Route path="/" element={<SignIn theme={theme} setTheme={setTheme} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </PrimeReactProvider>
  );
}