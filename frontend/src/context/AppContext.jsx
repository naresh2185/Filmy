import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [city, setCity] = useState(() => localStorage.getItem('bms_city') || 'Mumbai');
  const [user, setUserState] = useState(() => {
    const u = localStorage.getItem('bms_user');
    return u ? JSON.parse(u) : null;
  });
  const [authOpen, setAuthOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [booking, setBooking] = useState(() => {
    const b = sessionStorage.getItem('bms_booking');
    return b ? JSON.parse(b) : null;
  });

  useEffect(() => { localStorage.setItem('bms_city', city); }, [city]);
  useEffect(() => {
    if (user) localStorage.setItem('bms_user', JSON.stringify(user));
    else localStorage.removeItem('bms_user');
  }, [user]);
  useEffect(() => {
    if (booking) sessionStorage.setItem('bms_booking', JSON.stringify(booking));
    else sessionStorage.removeItem('bms_booking');
  }, [booking]);

  const setUser = (u, token) => {
    setUserState(u);
    if (token) sessionStorage.setItem('bms_token', token);
  };

  const logout = () => {
    setUserState(null);
    sessionStorage.removeItem('bms_token');
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
