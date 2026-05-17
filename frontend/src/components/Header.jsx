import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown, User, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';

const Header = () => {
  const { city, setCityOpen, user, setAuthOpen, logout } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const [menuOpen, setMenuOpen] = React.useState(false);

  const onSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/movies?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="flex-shrink-0">
          <div className="flex items-baseline">
            <span className="text-2xl font-extrabold tracking-tight" style={{ color: '#f84464' }}>Film</span>
            <span className="text-2xl font-extrabold tracking-tight text-gray-800">y</span>
            <span className="ml-1 w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#f84464' }} />
          </div>
        </Link>

        <form onSubmit={onSearch} className="flex-1 max-w-2xl hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for Movies, Events, Plays, Sports and Activities"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-400"
            />
          </div>
        </form>

        <button
          onClick={() => setCityOpen(true)}
          className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
        >
          <MapPin className="w-4 h-4" />
          <span>{city}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {user ? (
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <span className="hidden md:inline">Hi, {user.name || user.phone}</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg py-1">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">My Profile</button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Your Orders</button>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-500">Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <Button
            onClick={() => setAuthOpen(true)}
            className="text-white text-sm px-4 py-1.5 h-auto"
            style={{ background: '#f84464' }}
          >
            Sign in
          </Button>
        )}

        <button className="md:hidden">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <nav className="flex items-center gap-6 text-sm overflow-x-auto no-scrollbar">
            <Link to="/movies" className="hover:text-red-500 whitespace-nowrap">Movies</Link>
            <Link to="/events" className="hover:text-red-500 whitespace-nowrap">Stream</Link>
            <Link to="/events" className="hover:text-red-500 whitespace-nowrap">Events</Link>
            <Link to="/plays" className="hover:text-red-500 whitespace-nowrap">Plays</Link>
            <Link to="/sports" className="hover:text-red-500 whitespace-nowrap">Sports</Link>
            <Link to="/events" className="hover:text-red-500 whitespace-nowrap">Activities</Link>
          </nav>
          <div className="hidden md:flex items-center gap-4 text-xs text-gray-500">
            <span className="hover:text-gray-700 cursor-pointer">ListYourShow</span>
            <span className="hover:text-gray-700 cursor-pointer">Corporates</span>
            <span className="hover:text-gray-700 cursor-pointer">Offers</span>
            <span className="hover:text-gray-700 cursor-pointer">Gift Cards</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
