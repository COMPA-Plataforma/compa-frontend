import { useEffect, useState } from "react";

export function useDarkMode(role: "orientador" | "estudiante" = "orientador") {
  const key = `theme_${role}`;

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem(key) === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem(key, "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem(key, "light");
    }
  }, [isDark, key]);

  const toggle = () => setIsDark((prev) => !prev);

  return { isDark, toggle };
}