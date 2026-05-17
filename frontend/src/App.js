import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import CityModal from './components/CityModal';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import ListingPage from './pages/ListingPage';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <div className="App">
      <AppProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<ListingPage type="movies" />} />
            <Route path="/events" element={<ListingPage type="events" />} />
            <Route path="/plays" element={<ListingPage type="plays" />} />
            <Route path="/sports" element={<ListingPage type="sports" />} />
            <Route path="/movies/:id" element={<MovieDetails />} />
            <Route path="/booking/:id/seats" element={<SeatSelection />} />
            <Route path="/booking/:id/checkout" element={<Checkout />} />
            <Route path="/booking/:id/confirmation" element={<Confirmation />} />
          </Routes>
          <Footer />
          <AuthModal />
          <CityModal />
          <Toaster />
        </BrowserRouter>
      </AppProvider>
    </div>
  );
}

export default App;
