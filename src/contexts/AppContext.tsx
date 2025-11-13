"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  // Menu state
  isMenuActive: boolean;
  setIsMenuActive: (value: boolean) => void;

  // 未来可以添加更多状态
  // theme: 'light' | 'dark';
  // setTheme: (theme: 'light' | 'dark') => void;
  // isLoading: boolean;
  // setIsLoading: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isMenuActive, setIsMenuActive] = useState<boolean>(false);
  // const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  // const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <AppContext.Provider value={{
      isMenuActive,
      setIsMenuActive,
      // theme,
      // setTheme,
      // isLoading,
      // setIsLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
