import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { SEAT_CATEGORIES, BOOKED_SEATS, CINEMAS } from '../mock';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';
import { toast } from '../hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const SeatSelection = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const cinemaId = params.get('cinema');
  const time = params.get('time');
  const dateStr = params.get('date');
  const { user, setAuthOpen, setBooking } = useApp();
  const navigate = useNavigate();

  const [selected, setSelected] = useState([]);
  const cinema = CINEMAS.find(c => c.id === cinemaId) || CINEMAS[0];

  const toggleSeat = (id, price) => {
    if (BOOKED_SEATS.includes(id)) return;
    setSelected(prev => {
      const found = prev.find(s => s.id === id);
      if (found) return prev.filter(s => s.id !== id);
      if (prev.length >= 10) {
        toast({ title: 'Limit reached', description: 'You can select max 10 seats' });
        return prev;
      }
      return [...prev, { id, price }];
    });
  };

  const total = useMemo(() => selected.reduce((s, x) => s + x.price, 0), [selected]);
  const fee = selected.length ? 25 * selected.length : 0;
  const grand = total + fee;

  const proceed = () => {
    if (selected.length === 0) {
      toast({ title: 'No seats selected', description: 'Please select at least one seat' });
      return;
    }
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setBooking({
      movieId: id,
      cinema: cinema.name,
      time,
      date: dateStr,
      seats: selected.map(s => s.id),
      subtotal: total,
      fee,
      total: grand
    });
    navigate(`/booking/${id}/checkout`);
  };

  return (
    <div className="bg-white min-h-screen pb-32">
      <div className="bg-[#333] text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <p className="font-semibold text-sm">{cinema.name}</p>
            <p className="text-xs text-gray-300">{dateStr ? new Date(dateStr).toLocaleDateString('en', { weekday: 'short', day: '2-digit', month: 'short' }) : ''} • {time} • 2D</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-6 mb-8 justify-center text-xs">
          <div className="flex items-center gap-2"><div className="seat" style={{ width: 18, height: 18 }} />Available</div>
          <div className="flex items-center gap-2"><div className="seat selected" style={{ width: 18, height: 18 }} />Selected</div>
          <div className="flex items-center gap-2"><div className="seat booked" style={{ width: 18, height: 18 }} />Sold</div>
        </div>

        {SEAT_CATEGORIES.map(cat => (
          <div key={cat.name} className="mb-8">
            <p className="text-xs text-gray-500 mb-3">Rs. {cat.price} {cat.name}</p>
            <div className="space-y-1.5">
              {cat.rows.map(row => (
                <div key={row} className="flex items-center gap-1">
                  <span className="w-6 text-xs text-gray-400 text-center">{row}</span>
                  <div className="flex-1 flex justify-center gap-1">
                    {Array.from({ length: cat.cols }).map((_, i) => {
                      const seatId = `${row}${i + 1}`;
                      const isBooked = BOOKED_SEATS.includes(seatId);
                      const isSelected = selected.some(s => s.id === seatId);
                      const gapAfter = i === Math.floor(cat.cols / 2) - 1;
                      return (
                        <React.Fragment key={seatId}>
                          <button
                            onClick={() => toggleSeat(seatId, cat.price)}
                            disabled={isBooked}
                            className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                          >
                            {i + 1}
                          </button>
                          {gapAfter && <div style={{ width: 12 }} />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <span className="w-6 text-xs text-gray-400 text-center">{row}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="screen-curve mt-10" />
        <p className="text-center text-xs text-gray-500 mt-2">All eyes this way please!</p>
      </div>

      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{selected.length} Seat{selected.length > 1 ? 's' : ''} • {selected.map(s => s.id).join(', ')}</p>
              <p className="text-xs text-gray-500">Total: Rs. {grand}</p>
            </div>
            <Button onClick={proceed} className="text-white px-8" style={{ background: '#f84464' }}>Pay Rs. {grand}</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
