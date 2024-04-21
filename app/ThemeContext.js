// ThemeContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as RNUseColorScheme } from "react-native";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = RNUseColorScheme();
  const [theme, setTheme] = useState(systemScheme);

  useEffect(() => {
    setTheme(systemScheme);
  }, [systemScheme]);

  const toggleTheme = (themeMode) => {
    setTheme(themeMode); // 'light' or 'dark'
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
