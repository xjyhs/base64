"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";

interface ContextValue {
  theme: string;
  setTheme: (theme: string) => void;
  [propName: string]: any;
}

const AppContext = createContext({} as ContextValue);

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<string>(() => {
    return process.env.NEXT_PUBLIC_DEFAULT_THEME || "light";
  });

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
