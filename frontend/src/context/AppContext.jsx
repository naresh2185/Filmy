import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [city, setCity] = useState(() => localStorage.getItem('filmy_city') || 'Mumbai');
  const [user, setUserState] = useState(() => {
    const u = localStorage.getItem('filmy_user');
    return u ? JSON.parse(u) : null;
  });
  const [authOpen, setAuthOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [booking, setBooking] = useState(() => {
    const b = sessionStorage.getItem('filmy_booking');
    return b ? JSON.parse(b) : null;
  });

  useEffect(() => { localStorage.setItem('filmy_city', city); }, [city]);
  useEffect(() => {
    if (user) localStorage.setItem('filmy_user', JSON.stringify(user));
    else localStorage.removeItem('filmy_user');
  }, [user]);
  useEffect(() => {
    if (booking) sessionStorage.setItem('filmy_booking', JSON.stringify(booking));
    else sessionStorage.removeItem('filmy_booking');
  }, [booking]);

  const setUser = (u, token) => {
    setUserState(u);
    if (token) sessionStorage.setItem('filmy_token', token);
  };

  const logout = () => {
    setUserState(null);
    sessionStorage.removeItem('filmy_token');
  };

  return (
    <AppContext.Provider value={{
      city, setCity, user, setUser, authOpen, setAuthOpen,
      cityOpen, setCityOpen, booking, setBooking, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};
