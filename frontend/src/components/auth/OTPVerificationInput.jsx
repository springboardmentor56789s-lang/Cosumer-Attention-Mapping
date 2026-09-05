import React, { useState, useEffect } from 'react';
import { Mail, Smartphone, KeyRound, CheckCircle2, Send, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function OTPVerificationInput({
  target,
  channel = 'email',
  onVerified,
  label,
  buttonText = 'Send OTP',
  disabled = false,
}) {
  const { sendOTPCode, verifyOTPCode } = useAuth();
  
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verificationOtp, setVerificationOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!target) {
      setError(`Please enter a valid ${channel === 'email' ? 'email address' : 'phone number'} first.`);
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const res = await sendOTPCode(target, channel);
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setCountdown(60);
      setSuccessMsg(`OTP sent to ${target}`);
    } else {

      setError(res.error || 'Failed to send OTP code.');
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setError('');
    setLoading(true);
    const res = await verifyOTPCode(target, otpCode);
    setLoading(false);

    if (res.success) {
      setIsVerified(true);
      setSuccessMsg('Verified successfully!');
      if (onVerified) onVerified(target, otpCode);
    } else {
      setError(res.error || 'Invalid OTP verification code.');
    }
  };

  if (isVerified) {
    return (
      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">
            {channel === 'email' ? 'Email' : 'Phone'} Verified ({target})
          </span>
        </div>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-md uppercase tracking-wider">
          VERIFIED
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <label className="block font-semibold text-slate-300">
          {label || (channel === 'email' ? 'Email Verification OTP' : 'Phone Verification OTP')}
        </label>
        {!otpSent && (
          <button
            type="button"
            onClick={handleSendOTP}
            disabled={loading || disabled || !target}
            className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 disabled:opacity-50 flex items-center gap-1 transition"
          >
            <Send className="w-3 h-3" />
            <span>{loading ? 'Sending...' : buttonText}</span>
          </button>
        )}
      </div>

      {otpSent && (
        <div className="space-y-2 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter 6-digit OTP"
                className="w-full pl-9 pr-3 py-2 bg-black border border-slate-700 rounded-lg text-slate-100 font-mono tracking-widest text-center text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading || otpCode.length !== 6}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition shrink-0"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Code sent to <strong className="text-slate-200">{target}</strong>
            </span>
            {countdown > 0 ? (
              <span className="text-slate-500 font-mono">Resend in {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleSendOTP}
                className="text-purple-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" /> Resend Code
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] rounded-lg flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && !isVerified && (
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] rounded-lg flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
}
