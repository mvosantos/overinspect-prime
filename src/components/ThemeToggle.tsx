import React from "react";

interface ThemeToggleProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => (
  <button
    type="button"
    className="p-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow"
    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    aria-label="Alternar tema"
  >
    {theme === "dark" ? "🌞" : "🌙"}
  </button>
);

export default ThemeToggle;