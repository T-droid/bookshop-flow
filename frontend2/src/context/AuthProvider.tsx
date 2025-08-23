import React, { useState, useEffect, type ReactNode, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import apiClient from '@/api/api';
import { setAccessToken, getAccessToken } from '@/api/tokenManager';

import { LoginResponse } from '@/types/user';


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const accessTokenRef = useRef<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [role, setRole] = useState<string | null>(null);
  const location = useLocation();


  useEffect(() => {
    if (location.pathname.startsWith('/auth')) {
      setIsLoading(false);
      return;
    }
    refresh()    
  }, [location.pathname]);

  const refresh = () => {
    apiClient.post("/auth/refresh")
      .then(res => {
        setAccessToken(res.data.access_token);
        accessTokenRef.current = getAccessToken()
        setIsAuthenticated(true)
        setRole(res.data.role);
        setUser(res.data);
      })
      .catch(err => {
        setAccessToken(null);
        setIsAuthenticated(false)
        setUser(null);
        accessTokenRef.current = null;
        setRole(null);
      })
      .finally(() => {
        setIsLoading(false);
      })
  }
  const logIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const res = await apiClient.post("/auth/login", {
        email,
        password
      });
      
      setAccessToken(res.data.access_token);
      accessTokenRef.current = getAccessToken();
      setIsAuthenticated(true);
      setUser(res.data);
      setRole(res.data.role);
    } catch (err) {
      setAccessToken(null);
      setIsAuthenticated(false);
      setUser(null);
      accessTokenRef.current = null;
      setRole(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }


  const logOut = async () => {
    apiClient.post("/auth/logout")
      .then(res => {
        setAccessToken(null);
        setIsAuthenticated(false);
        setUser(null);
        accessTokenRef.current = null;
        setRole(null);
      })
      .catch(err => {
        console.log(err)
      })
      .finally(() => {
        setIsLoading(false);
      })
    };

  const hasRole = (userRole: string) =>  role === userRole;
  
  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      user,
      logIn,
      logOut,
      hasRole,
      accessTokenRef
    }}>
      {children}
    </AuthContext.Provider>
  );
};
