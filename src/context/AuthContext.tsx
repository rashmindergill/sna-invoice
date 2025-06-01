
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  users: User[];
  addUser: (username: string, password: string) => boolean;
  deleteUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Initialize default admin user
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (savedUsers.length === 0) {
      const defaultAdmin = {
        id: '1',
        username: 'admin',
        password: 'password',
        role: 'admin' as const,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('users', JSON.stringify([defaultAdmin]));
      setUsers([defaultAdmin]);
    } else {
      setUsers(savedUsers);
    }

    // Check if user is already logged in
    const savedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = savedUsers.find((u: any) => u.username === username && u.password === password);
    
    if (foundUser) {
      const userSession = {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
        createdAt: foundUser.createdAt,
      };
      setUser(userSession);
      localStorage.setItem('currentUser', JSON.stringify(userSession));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const addUser = (username: string, password: string): boolean => {
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = savedUsers.some((u: any) => u.username === username);
    
    if (userExists) {
      return false;
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      password,
      role: 'user' as const,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...savedUsers, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    return true;
  };

  const deleteUser = (userId: string) => {
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = savedUsers.filter((u: any) => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, users, addUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
};
