
import { useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("debugg-theme");

    if (saved === "light") {
      document.body.className = "light";
      return "light";
    }

    document.body.className = "";
    return "dark";
  });

  return { theme, setTheme };
}
