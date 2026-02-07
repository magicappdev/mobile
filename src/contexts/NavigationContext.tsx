/**
 * Navigation Context
 *
 * Provides a navigation function that can be used from non-component contexts
 * (like AuthContext) to navigate using React Router v5.
 */

import { createContext, useContext } from "react";
import { appHistory } from "../lib/history";

interface NavigationContextType {
  navigate: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = (path: string) => {
    appHistory.push(path);
  };

  return (
    <NavigationContext.Provider value={{ navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
}
