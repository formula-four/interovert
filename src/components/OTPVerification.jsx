import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { setSession } from '../utils/session';
import apiClient from '../services/apiClient';

export default function OTPVerification({ email, onVerificationComplete }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const focusOtpInput = (i) => {
    requestAnimationFrame(() => {
      document.getElementById(`otp-${i}`)?.focus();
    });
  };

  const handleChange = (e, index) => {
    if (isVerifying) return;
    const raw = e.target.value;

    if (raw === '') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const digit = raw.replace(/\D/g, '').slice(-1);
    if (!digit) return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (index < 5) {
      focusOtpInput(index + 1);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isVerifying) handleSubmit();
      return;
    }

    if (e.key !== 'Backspace') return;

    // Current box empty → go back and clear previous digit (repeatable for each backspace)
    if (!otp[index] && index > 0) {
      e.preventDefault();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      focusOtpInput(index - 1);
    }
    // Current box has a digit → default backspace + onChange clears it
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }
    setIsVerifying(true);
    try {
      const { data } = await apiClient.post('/api/verify-otp', { email, otp: otpString });
      toast.success('Email verified successfully!');
      setSession({ token: data.token, user: data.user });
      onVerificationComplete();
    } catch (error) {
      toast.error(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Enter Verification Code</h2>
        <p className="text-gray-600 text-center mb-6">
          We've sent a code to {email}
        </p>
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="contents"
        >
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={isVerifying}
                className="w-12 h-12 text-center text-2xl border-2 rounded-lg focus:border-indigo-600 focus:ring-indigo-600 disabled:opacity-50"
              />
            ))}
          </div>

          <div className="text-center mb-6">
            <p className="text-gray-600">
              Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </p>
          </div>

          <motion.button
            type="submit"
            whileHover={isVerifying ? undefined : { scale: 1.05 }}
            whileTap={isVerifying ? undefined : { scale: 0.95 }}
            disabled={isVerifying}
            aria-busy={isVerifying}
            className="flex w-full items-center justify-center gap-2 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Verifying…
              </>
            ) : (
              'Verify'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
