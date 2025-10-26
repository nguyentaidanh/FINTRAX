
import React, { createContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { User } from '../types/types';
import { INITIAL_USERS } from '../constants/constants';

interface AuthContextProps {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, dob: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string; }>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem('currentUserId'));

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUserId(user.id);
      localStorage.setItem('currentUserId', user.id);
      return true;
    }
    return false;
  }, [users]);

  const register = useCallback(async (name: string, email: string, password: string, dob: string): Promise<boolean> => {
    const userExists = users.some(u => u.email === email);
    if (userExists) {
      return false; // Email already in use
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      dob,
      avatar: `https://i.pravatar.cc/128?u=${Date.now()}`, // Generate a random avatar
      currency: 'USD',
      notificationSettings: {
        reminders: { recurring: { enabled: true, daysBefore: 3 } },
        pagination: { itemsPerPage: 10 }
      }
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    setCurrentUserId(newUser.id);
    localStorage.setItem('currentUserId', newUser.id);
    return true;
  }, [users]);

  const sendPasswordReset = useCallback(async (email: string): Promise<void> => {
    // In a real app, this would trigger a backend service to send an email.
    // For this mock, we'll just log it and assume it works if the user exists.
    const userExists = users.some(u => u.email === email);
    if (userExists) {
        console.log(`Password reset link sent to ${email}`);
    } else {
        console.log(`Attempted password reset for non-existent email: ${email}`);
    }
  }, [users]);


  const logout = useCallback(() => {
    setCurrentUserId(null);
    localStorage.removeItem('currentUserId');
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user));
  }, []);

  const changePassword = useCallback(async (userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string; }> => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: "User not found." };
    }
    if (user.password !== currentPassword) {
      return { success: false, message: "Incorrect current password." };
    }
    
    const updatedUser = { ...user, password: newPassword };
    setUsers(prevUsers => prevUsers.map(u => (u.id === userId ? updatedUser : u)));
    
    return { success: true, message: "Password updated successfully." };
  }, [users]);

  const currentUser = useMemo(() => {
    return users.find(user => user.id === currentUserId) || null;
  }, [currentUserId, users]);

  return (
    <AuthContext.Provider value={{ currentUser, users, login, register, sendPasswordReset, logout, updateUser, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
