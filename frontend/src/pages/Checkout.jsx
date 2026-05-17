import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { CreditCard, Wallet, Smartphone, ShieldCheck } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const Checkout = () => {
  const { id } = useParams();
  const { booking, user } = useApp();
  const navigate = useNavigate();
  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">No booking found.</p>
        <Button onClick={() => navigate('/')} className="mt-4">Go Home</Button>
      </div>
    );
  }

  const pay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      navigate(`/booking/${id}/confirmation`);
    }, 1500);
  };

  const methods = [
    { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
    { id: 'upi', label: 'UPI', icon: Smartphone },
    { id: 'wallet', label: 'Wallets', icon: Wallet }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-[#333] text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <p className="font-semibold">Checkout</p>
          <p className="text-xs text-gray-300">Complete your payment</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-md p-6">
          <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
          <div className="space-y-2 mb-6">
            {methods.map(m => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-md border ${method === m.id ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
              >
                <m.icon className="w-5 h-5 text-gray-700" />
                <span className="font-medium text-sm">{m.label}</span>
              </button>
            ))}
          </div>

          {method === 'card' && (
            <div className="space-y-3">
              <input className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" placeholder="Card Number" />
              <div className="grid grid-cols-2 gap-3">
                <input className="border border-gray-200 rounded-md px-3 py-2 text-sm" placeholder="MM / YY" />
                <input className="border border-gray-200 rounded-md px-3 py-2 text-sm" placeholder="CVV" />
              </div>
              <input className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" placeholder="Name on Card" />
            </div>
          )}
          {method === 'upi' && (
            <input className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" placeholder="username@upi" />
          )}
          {method === 'wallet' && (
            <p className="text-sm text-gray-500">Choose your wallet provider at next step.</p>
          )}

          <div className="flex items-center gap-2 mt-6 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-green-600" /> Your transaction is 100% secure.
          </div>
        </div>

        <div className="bg-white rounded-md p-6 h-fit">
          <h2 className="font-semibold mb-3">Booking Summary</h2>
          <div className="text-xs text-gray-600 space-y-1 mb-4">
            <p>{booking.cinema}</p>
            <p>{booking.date ? new Date(booking.date).toLocaleDateString('en', { weekday: 'short', day: '2-digit', month: 'short' }) : ''} • {booking.time}</p>
            <p>Seats: <span className="font-medium text-gray-800">{booking.seats.join(', ')}</span></p>
          </div>
          <div className="border-t border-gray-100 pt-3 text-sm space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>Rs. {booking.subtotal}</span></div>
            <div className="flex justify-between text-gray-500 text-xs"><span>Convenience fee</span><span>Rs. {booking.fee}</span></div>
            <div className="flex justify-between font-semibold pt-2 border-t border-gray-100 mt-2"><span>Amount Payable</span><span>Rs. {booking.total}</span></div>
          </div>
          <Button onClick={pay} disabled={processing} className="w-full mt-5 text-white" style={{ background: '#f84464' }}>
            {processing ? 'Processing…' : `Pay Rs. ${booking.total}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
