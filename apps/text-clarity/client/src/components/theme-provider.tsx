import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  // Always force light theme - no localStorage or system preference detection
  const [theme] = useState<Theme>("light");

  useEffect(() => {
    const root = document.documentElement;
    // Remove any dark theme classes and ensure light theme is set
    root.classList.remove("dark");
    root.classList.add("light");
  }, []);

  // Provide a no-op setTheme function to maintain context structure
  const setTheme = () => {
    // No-op: theme switching is disabled
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
