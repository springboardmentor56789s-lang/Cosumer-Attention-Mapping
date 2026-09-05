import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight, AlertCircle, KeyRound, Smartphone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import OAuthModal from '../../components/auth/OAuthModal';
import RegisterModal from '../../components/auth/RegisterModal';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@retailai.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const [activeOAuth, setActiveOAuth] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Invalid email or password credentials');
    }
  };

  const handleDemoFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('demo123');
  };

  const handleSendReset = (e) => {
    e.preventDefault();
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-8 backdrop-blur-xl relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center shadow-lg mb-3">
            <Eye className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">RetaiLVision AI</h1>
          <p className="text-xs text-zinc-400 mt-1">Enterprise Consumer Attention Platform</p>
        </div>

        {/* OAuth Provider Row */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block text-center">
            Sign In with OAuth
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveOAuth('google')}
              className="py-2.5 px-3 bg-white hover:bg-zinc-100 text-black text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              onClick={() => setActiveOAuth('microsoft')}
              className="py-2.5 px-3 bg-[#2f2f2f] hover:bg-[#3f3f3f] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              <span>Microsoft</span>
            </button>

            <button
              onClick={() => setActiveOAuth('github')}
              className="py-2.5 px-3 bg-[#24292e] hover:bg-[#2f363d] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-zinc-800 w-full"></div>
          <span className="bg-zinc-950 px-3 text-[10px] text-zinc-500 uppercase font-mono tracking-widest absolute">Or Work Email</span>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">Work Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@retailai.com"
                className="w-full pl-10 pr-4 py-2.5 bg-black border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-zinc-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-black border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-zinc-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-zinc-800 bg-black text-zinc-200 focus:ring-0"
              />
              <span>Remember Me</span>
            </label>
            <button
              type="button"
              onClick={() => { setShowForgotPassword(true); setForgotSent(false); }}
              className="text-zinc-300 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-xl border border-zinc-700 shadow flex items-center justify-center gap-2 transition"
          >
            <span>{loading ? 'Authenticating Session...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick RBAC Role Presets */}
        <div className="pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-2">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
              Quick Role Login Presets
            </span>

            <button onClick={() => setShowRegisterModal(true)} className="text-zinc-300 hover:underline">
              Create New Account
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={() => handleDemoFill('admin@retailai.com')}
              className="px-2.5 py-1.5 bg-black border border-zinc-800 hover:border-zinc-600 rounded-lg text-zinc-300 text-left transition"
            >
              👑 <strong className="text-purple-400">Admin</strong>
            </button>
            <button
              onClick={() => handleDemoFill('manager@retailai.com')}
              className="px-2.5 py-1.5 bg-black border border-zinc-800 hover:border-zinc-600 rounded-lg text-zinc-300 text-left transition"
            >
              🏬 <strong className="text-zinc-200">Store Mgr</strong>
            </button>
            <button
              onClick={() => handleDemoFill('analyst@retailai.com')}
              className="px-2.5 py-1.5 bg-black border border-zinc-800 hover:border-zinc-600 rounded-lg text-zinc-300 text-left transition"
            >
              📊 <strong className="text-emerald-400">Analyst</strong>
            </button>
            <button
              onClick={() => handleDemoFill('marketing@retailai.com')}
              className="px-2.5 py-1.5 bg-black border border-zinc-800 hover:border-zinc-600 rounded-lg text-zinc-300 text-left transition"
            >
              📢 <strong className="text-amber-400">Marketing</strong>
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/landing')}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition"
          >
            ← Back to Platform Landing Page
          </button>
        </div>
      </div>

      {/* Modals */}
      <OAuthModal
        provider={activeOAuth}
        isOpen={!!activeOAuth}
        onClose={() => setActiveOAuth(null)}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
    </div>
  );
}
