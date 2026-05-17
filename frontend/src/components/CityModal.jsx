import React, { useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { useApp } from '../context/AppContext';
import { CITIES } from '../mock';
import { Search, MapPin } from 'lucide-react';

const CityModal = () => {
  const { cityOpen, setCityOpen, setCity } = useApp();
  const [q, setQ] = useState('');

  const filtered = CITIES.filter(c => c.toLowerCase().includes(q.toLowerCase()));

  const pick = (c) => {
    setCity(c);
    setCityOpen(false);
    setQ('');
  };

  return (
    <Dialog open={cityOpen} onOpenChange={setCityOpen}>
      <DialogContent className="sm:max-w-2xl">
        <h2 className="text-lg font-semibold mb-3">Select your city</h2>
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for your city"
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-400"
          />
        </div>
        <p className="text-xs uppercase text-gray-500 mb-3">Popular Cities</p>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {filtered.map(c => (
            <button
              key={c}
              onClick={() => pick(c)}
              className="flex flex-col items-center p-3 rounded-md hover:bg-gray-50 transition-colors"
            >
              <MapPin className="w-6 h-6 text-gray-500 mb-1" />
              <span className="text-xs text-gray-700 text-center">{c}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CityModal;
