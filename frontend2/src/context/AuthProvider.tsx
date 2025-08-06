import React, { useState, useEffect, type ReactNode, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import apiClient from '@/api/api';
import { setAccessToken, getAccessToken } from '@/api/tokenManager';


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const accessTokenRef = useRef<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
      })
      .catch(err => {
        setAccessToken(null);
        setIsAuthenticated(false)       
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
      
    } catch (err) {
      setAccessToken(null);
      setIsAuthenticated(false);
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
      })
      .catch(err => {
        console.log(err)
      })
      .finally(() => {
        setIsLoading(false);
      })
    };
  
  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      logIn,
      logOut,
      accessTokenRef
    }}>
      {children}
    </AuthContext.Provider>
  );
};
