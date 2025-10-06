import { PrimeReactProvider } from "primereact/api";
import { useTheme } from "./hooks/useTheme";
import SignIn from "./screens/SignIn";
import ForgotPassword from "./screens/ForgotPassword";
import { Routes, Route } from "react-router-dom";
import Home from "./screens/Home";

export default function App() {
  const { theme, setTheme } = useTheme();
  const value = { ripple: true, unstyled: false };

  return (
    <PrimeReactProvider value={value}>
      <Routes>
        <Route path="/" element={<SignIn theme={theme} setTheme={setTheme} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </PrimeReactProvider>
  );
}