import React, { createContext, useState, useEffect } from 'react';
import { fetchProfile, logoutUser } from './authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await fetchProfile();
        setUser(userData);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  // Token Expiration
  useEffect(() => {
    if (!user) return; // only poll when logged in

    let cancelled = false;

    async function checkSession() {
      const profile = await fetchProfile(); 
      if (!cancelled && profile) {
        setUser(profile);
      }
    }

    // check after login
    checkSession();

    // poll every 5 seconds
    const id = setInterval(checkSession, 5000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
