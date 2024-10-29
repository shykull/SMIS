import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const useAuthProvider = () => {
  const [auth, setAuth] = useState({ status: false, user: null, id: 0, permit: [], loading: true });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/user/status', { withCredentials: true });
        if (response.data.loggedIn) {
          
          setAuth({ status: true, user: response.data.user.username, id: response.data.user.id, permit: response.data.user.Permission ,loading: false });
        } else {
          setAuth({ status: false, user: null, id: 0, permit: [], loading: false });
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setAuth({ status: false, user: null, id: 0, permit: [], loading: false });
      }
    };

    checkAuth();
  }, []);

  return { auth, setAuth };
};

export const AuthProvider = ({ children }) => {
  const authContextValue = useAuthProvider();

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};
