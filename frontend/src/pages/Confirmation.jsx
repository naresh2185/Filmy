import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { CheckCircle2, Calendar, MapPin, Ticket, Download } from 'lucide-react';
import { getMovieDetails, IMG } from '../lib/tmdb';

const Confirmation = () => {
  const { id } = useParams();
  const { booking, setBooking } = useApp();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    if (id) getMovieDetails(id).then(setMovie).catch(() => {});
  }, [id]);

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">No booking found.</p>
        <Button onClick={() => navigate('/')} className="mt-4">Go Home</Button>
      </div>
    );
  }

  const bookingId = booking.bookingRef || `FLM${Date.now().toString().slice(-8)}`;

  const goHome = () => {
    setBooking(null);
    navigate('/');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          <div className="bg-green-50 p-6 text-center border-b border-green-100">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <h1 className="text-xl font-bold text-gray-800">Booking Confirmed!</h1>
            <p className="text-xs text-gray-600 mt-1">Booking ID: <span className="font-semibold">{bookingId}</span></p>
          </div>

          <div className="p-6">
            <div className="flex gap-4 pb-4 border-b border-dashed border-gray-200">
              {movie && (
                <img src={IMG(movie.poster_path)} alt={movie.title} className="w-20 rounded" />
              )}
              <div className="flex-1">
                <h2 className="font-semibold text-gray-800">{movie?.title || 'Movie'}</h2>
                <p className="text-xs text-gray-500 mt-1">{movie?.genres?.map(g => g.name).join(', ')}</p>
                <p className="text-xs text-gray-500">2D • {movie?.original_language?.toUpperCase()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 py-4 text-xs">
              <div>
                <p className="text-gray-500">Date & Time</p>
                <p className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" /> {booking.date ? new Date(booking.date).toLocaleDateString('en', { day: '2-digit', month: 'short' }) : ''} • {booking.time}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Tickets</p>
                <p className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5"><Ticket className="w-3 h-3" /> {booking.seats.length}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Cinema</p>
                <p className="font-semibold text-gray-800 flex items-start gap-1 mt-0.5"><MapPin className="w-3 h-3 mt-0.5" />{booking.cinema}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Seats</p>
                <p className="font-semibold text-gray-800 mt-0.5">{booking.seats.join(', ')}</p>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between">
              <span className="text-sm text-gray-600">Amount Paid</span>
              <span className="text-sm font-semibold">Rs. {booking.total}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 flex gap-3">
            <Button variant="outline" className="flex-1"><Download className="w-4 h-4 mr-1" />Download</Button>
            <Button onClick={goHome} className="flex-1 text-white" style={{ background: '#f84464' }}>Done</Button>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-4">An email & SMS with your ticket details has been sent (demo).</p>
      </div>
    </div>
  );
};

export default Confirmation;
