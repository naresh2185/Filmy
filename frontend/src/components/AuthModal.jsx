import React, { useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { useApp } from '../context/AppContext';
import { Phone, ArrowLeft } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { authApi } from '../lib/api';

const AuthModal = () => {
  const { authOpen, setAuthOpen, setUser } = useApp();
  const [step, setStep] = useState('phone'); // phone | otp
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const reset = () => { setStep('phone'); setPhone(''); setOtp(['', '', '', '', '', '']); };

  const handleClose = (open) => {
    if (!open) reset();
    setAuthOpen(open);
  };

  const sendOtp = async () => {
    if (phone.length !== 10) {
      toast({ title: 'Invalid number', description: 'Please enter a valid 10-digit mobile number' });
      return;
    }
    setLoading(true);
    try {
      await authApi.sendOtp(phone);
      setStep('otp');
      toast({ title: 'OTP sent', description: 'Use any 6 digits to continue (demo)' });
    } catch (e) {
      toast({ title: 'Failed', description: e.response?.data?.detail || 'Unable to send OTP' });
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast({ title: 'Invalid OTP', description: 'Please enter all 6 digits' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp(phone, code);
      setUser(data.user, data.token);
      toast({ title: 'Welcome!', description: 'You are now signed in' });
      reset();
      setAuthOpen(false);
    } catch (e) {
      toast({ title: 'Failed', description: e.response?.data?.detail || 'Verification failed' });
    }
    setLoading(false);
  };

  const onOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      const el = document.getElementById(`otp-${idx + 1}`);
      el?.focus();
    }
  };

  return (
    <Dialog open={authOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="flex">
          <div className="hidden md:flex flex-col items-center justify-center w-2/5 p-6" style={{ background: 'linear-gradient(135deg, #fff5f6 0%, #ffe9ed 100%)' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3" style={{ background: '#f84464' }}>
              <Phone className="w-10 h-10 text-white" />
            </div>
            <p className="text-center text-sm font-semibold text-gray-800">Booking made easy</p>
            <p className="text-center text-xs text-gray-600 mt-1">Sign in and unlock offers</p>
          </div>
          <div className="flex-1 p-6">
            {step === 'phone' ? (
              <>
                <h2 className="text-xl font-semibold mb-1">Get started</h2>
                <p className="text-xs text-gray-500 mb-5">Login or sign up to continue</p>
                <div className="flex border border-gray-200 rounded-md overflow-hidden mb-4">
                  <div className="px-3 py-2 bg-gray-50 text-sm text-gray-600 border-r border-gray-200">+91</div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter Mobile Number"
                    className="flex-1 px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <Button onClick={sendOtp} disabled={loading} className="w-full text-white" style={{ background: '#f84464' }}>{loading ? 'Sending…' : 'Continue'}</Button>
                <p className="text-[10px] text-gray-400 mt-4 text-center">By proceeding, you agree to our Terms & Conditions and Privacy Policy</p>
              </>
            ) : (
              <>
                <button onClick={() => setStep('phone')} className="flex items-center text-xs text-gray-500 mb-3">
                  <ArrowLeft className="w-3 h-3 mr-1" /> Back
                </button>
                <h2 className="text-xl font-semibold mb-1">Verify with OTP</h2>
                <p className="text-xs text-gray-500 mb-5">Sent to +91 {phone}</p>
                <div className="flex gap-2 mb-5">
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      maxLength={1}
                      value={d}
                      onChange={(e) => onOtpChange(i, e.target.value)}
                      className="w-10 h-11 text-center border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 text-lg"
                    />
                  ))}
                </div>
                <Button onClick={verifyOtp} disabled={loading} className="w-full text-white" style={{ background: '#f84464' }}>{loading ? 'Verifying…' : 'Verify'}</Button>
                <p className="text-xs text-gray-500 mt-3 text-center">Didn't receive? <span className="text-red-500 cursor-pointer">Resend OTP</span></p>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
