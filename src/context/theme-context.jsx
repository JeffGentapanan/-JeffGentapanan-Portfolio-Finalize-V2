import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
const ThemeContext = createContext(null);
const key = 'jeff.clear.theme';
/** Reads the pre-paint theme set in index.html; storage failure never blocks rendering. */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
  );
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(key, theme);
    } catch {
      /* The selected theme still works without persistence. */
    }
  }, [theme]);
  useEffect(() => {
    const sync = (event) => {
      if (event.key === key && (event.newValue === 'light' || event.newValue === 'dark'))
        setTheme(event.newValue);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  return (
    <ThemeContext.Provider value={{ resolvedTheme: theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('ThemeProvider is required.');
  return value;
}
