'use client'
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Define UserContext Type
type UserContextType = {
  user: { name: string | null; token: string | null };
  loginUser: (name: string, token: string) => void;
  logoutUser: () => void;
};

// Create Context
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ name: string | null; token: string | null }>({
    name: null,
    token: null,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []); // Added missing dependency array

  // Login Function
  const loginUser = (name: string, token: string) => {
    setUser({ name, token });
    console.log('UserLogin Called');
    localStorage.setItem("user", JSON.stringify({ name, token })); // Store user session
  };

  // Logout Function
  const logoutUser = () => {
    setUser({ name: null, token: null });
    localStorage.removeItem("user");
  }; // Fixed missing closing bracket

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook for Consuming Context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
