import React, { useState } from 'react';
import { HardHat, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ArrowLeft, KeyRound, Smartphone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail } from '../../utils/validators';
import OTPVerificationInput from '../../components/auth/OTPVerificationInput';

export default function WorkerLogin() {
  const { loginWorker, loginWithOTP, loginWorkerGoogle, loading } = useAuth();
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

    const res = await loginWorker(email, password);
    if (res.success) {
      navigate('/worker-dashboard');
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

    const res = await loginWithOTP(phoneOrEmail, otpCode, 'Worker');
    if (res.success) {
      navigate('/worker-dashboard');
    } else {
      setError(res.error || 'OTP Login failed.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const res = await loginWorkerGoogle();
    if (res.success) {
      navigate('/worker-dashboard');
    } else {
      setError(res.error || 'Google authentication failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-black to-slate-950 pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        <Link
          to="/auth"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Role Selection
        </Link>

        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-lg">
            <HardHat className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Worker Authentication</h2>
          <p className="text-xs text-slate-400">
            Sign in to access your assigned store tasks and status updates
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setAuthMode('password'); setError(''); }}
            className={`py-2 rounded-lg transition ${
              authMode === 'password'
                ? 'bg-blue-600 text-white shadow'
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
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> OTP Verification
          </button>
        </div>

        {/* Google OAuth Option for Workers */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.15C3.25 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.28C.46 8.2 0 10.04 0 12s.46 3.8 1.28 5.42l4-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.58l4 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

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
              <label className="block font-semibold text-slate-300 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah.worker@retailstore.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
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
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
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
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Authenticating Worker...' : 'Login to Worker Dashboard'}
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
                  placeholder="sarah.worker@retailstore.com or +1 (555) 019-2834"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
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
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Verifying Session...' : 'Verify OTP & Access Worker Dashboard'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Don't have a Worker account?{' '}
          <Link to="/auth/worker/register" className="text-blue-400 hover:underline font-bold">
            Register Worker Account
          </Link>
        </div>
      </div>
    </div>
  );
}

