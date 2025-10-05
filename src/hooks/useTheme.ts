import { useEffect, useState } from "react";

const LIGHT_THEME = "lara-light-teal";
const DARK_THEME = "lara-dark-teal";

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    const themeCss = theme === "dark"
      ? `/primereact/resources/themes/${DARK_THEME}/theme.css`
      : `/primereact/resources/themes/${LIGHT_THEME}/theme.css`;

    // Remove old theme
    document.querySelectorAll("link[data-pr-theme]").forEach((el) => el.remove());

    // Add new theme
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = themeCss;
    link.setAttribute("data-pr-theme", "true");
    document.head.appendChild(link);

    // Tailwind dark class
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}