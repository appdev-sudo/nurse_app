/**
 * Auth context for the Nurse App.
 * Mirrors the Customer App's authContext pattern, using NurseProfile.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NurseProfile } from '../types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  nurse: NurseProfile | null;
  loading: boolean;
  login: (token: string, nurse: NurseProfile) => Promise<void>;
  logout: () => Promise<void>;
  updateNurse: (nurse: NurseProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@vytalyou_nurse_token';
const NURSE_KEY = '@vytalyou_nurse_data';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [nurse, setNurse] = useState<NurseProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const [storedToken, storedNurse] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(NURSE_KEY),
      ]);

      if (storedToken && storedNurse) {
        setToken(storedToken);
        setNurse(JSON.parse(storedNurse));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to load nurse auth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (newToken: string, newNurse: NurseProfile) => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      await AsyncStorage.setItem(NURSE_KEY, JSON.stringify(newNurse));
      setToken(newToken);
      setNurse(newNurse);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to save nurse auth data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, NURSE_KEY]);
      setToken(null);
      setNurse(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to clear nurse auth data:', error);
    }
  };

  const updateNurse = (updatedNurse: NurseProfile) => {
    setNurse(updatedNurse);
    AsyncStorage.setItem(NURSE_KEY, JSON.stringify(updatedNurse));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        nurse,
        loading,
        login,
        logout,
        updateNurse,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
