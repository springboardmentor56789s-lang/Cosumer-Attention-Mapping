import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ArrowLeft, KeyRound, Smartphone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail } from '../../utils/validators';
import OTPVerificationInput from '../../components/auth/OTPVerificationInput';

export default function ManagerLogin() {
  const { loginManager, loginWithOTP, loading } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState('password'); // 'password' or 'otp'
  const [email, setEmail] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setError('');

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    const res = await loginManager(email, password);
    if (res.success) {
      navigate('/manager-dashboard');
    } else {
      setError(res.error || 'Authentication failed.');
    }
  };

  const handleSubmitOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!phoneOrEmail) {
      setError('Please enter your email address or phone number.');
      return;
    }

    if (!otpCode || otpCode.length !== 6) {
      setError('Please verify with a valid 6-digit OTP code.');
      return;
    }

    const res = await loginWithOTP(phoneOrEmail, otpCode, 'Manager');
    if (res.success) {
      navigate('/manager-dashboard');
    } else {
      setError(res.error || 'OTP Login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-black to-slate-950 pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        <Link
          to="/auth"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Role Selection
        </Link>

        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Manager Authentication</h2>
          <p className="text-xs text-slate-400">
            Store Managers & Operations Executive Dashboard Access
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setAuthMode('password'); setError(''); }}
            className={`py-2 rounded-lg transition ${
              authMode === 'password'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('otp'); setError(''); }}
            className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              authMode === 'otp'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> OTP Verification
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Password Form */}
        {authMode === 'password' ? (
          <form onSubmit={handleSubmitPassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Company Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="eleanor@retail.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Authenticating Manager...' : 'Login to Manager Dashboard'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        ) : (
          /* OTP Form */
          <form onSubmit={handleSubmitOTP} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Registered Email or Phone *</label>
              <div className="relative">
                {phoneOrEmail.includes('@') || !phoneOrEmail ? (
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                ) : (
                  <Smartphone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                )}
                <input
                  type="text"
                  required
                  value={phoneOrEmail}
                  onChange={(e) => {
                    setPhoneOrEmail(e.target.value);
                    setOtpVerified(false);
                  }}
                  placeholder="eleanor@retail.com or +1 (555) 019-2834"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            <OTPVerificationInput
              target={phoneOrEmail}
              channel={phoneOrEmail.includes('@') ? 'email' : 'phone'}
              onVerified={(target, code) => {
                setOtpCode(code);
                setOtpVerified(true);
              }}
              label="One-Time Verification Password (OTP)"
              buttonText="Send 6-Digit OTP"
            />

            <button
              type="submit"
              disabled={loading || !otpVerified}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Verifying Session...' : 'Verify OTP & Access Dashboard'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Don't have a Manager account?{' '}
          <Link to="/auth/manager/register" className="text-purple-400 hover:underline font-bold">
            Register Manager Account
          </Link>
        </div>
      </div>
    </div>
  );
}

