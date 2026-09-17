import React, { useState, useEffect } from 'react';
import { 
  ArrowUp, 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Check 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import OAuthModal from '../../components/auth/OAuthModal';
import RegisterModal from '../../components/auth/RegisterModal';

export default function LoginPage() {
  const { login, loginManager, loginWorker, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('Manager'); // 'Manager' or 'Worker'

  const [activeOAuth, setActiveOAuth] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Animated Typing Placeholder for the Right Panel Pill
  const [aiPromptText, setAiPromptText] = useState('');
  const fullPromptText = 'Ask RetaiLVision AI to map your store dwell time & attention heatmaps...';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullPromptText.length) {
        setAiPromptText(fullPromptText.slice(0, index));
        index++;
      } else {
        setTimeout(() => { index = 0; }, 3000);
      }
    }, 55);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    let res;
    if (selectedRole === 'Manager') {
      res = await loginManager(email, password);
    } else {
      res = await loginWorker(email, password);
    }

    if (res && res.success) {
      navigate(selectedRole === 'Manager' ? '/manager-dashboard' : '/worker-dashboard');
    } else {
      // Fallback standard login
      const stdRes = await login(email, password);
      if (stdRes && stdRes.success) {
        navigate('/');
      } else {
        setError((res && res.error) || (stdRes && stdRes.message) || 'Invalid credentials.');
      }
    }
  };

  const handleDemoSelect = (role, demoEmail) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0d0d11] text-slate-100 flex items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
      
      {/* Container - 2 Column Lovable Style Split */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* LEFT COLUMN: Clean Lovable Style Auth Form */}
        <div className="lg:col-span-5 max-w-md w-full mx-auto space-y-7 pr-0 lg:pr-2">
          
          {/* Logo Brand Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ff455d] via-[#f72585] to-[#7209b7] p-0.5 shadow-xl shadow-pink-500/20 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#0d0d11] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-5.5 h-5.5 text-pink-400" />
                </div>
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-pink-400 font-mono">RetaiLVision AI</div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                  Consumer Attention Mapping System
                </h1>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Role-based spatial intelligence & store operations system. Log in to continue.
            </p>
          </div>

          {/* Social SSO Buttons - Full Pill Stack */}
          <div className="space-y-3">
            {/* Google Pill */}
            <div className="relative">
              <span className="absolute -top-2.5 right-4 z-10 bg-[#1d2744] text-[#7090f7] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#2b3b6b] shadow-sm">
                Last used
              </span>
              <button
                type="button"
                onClick={() => setActiveOAuth('google')}
                className="w-full py-3 px-5 bg-[#17171c] hover:bg-[#202027] border border-slate-800/80 hover:border-slate-700 rounded-full text-xs font-semibold text-slate-100 flex items-center justify-center gap-3 transition duration-200 shadow-md"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* GitHub Pill */}
            <button
              type="button"
              onClick={() => setActiveOAuth('github')}
              className="w-full py-3 px-5 bg-[#17171c] hover:bg-[#202027] border border-slate-800/80 hover:border-slate-700 rounded-full text-xs font-semibold text-slate-100 flex items-center justify-center gap-3 transition duration-200 shadow-md"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>Continue with GitHub</span>
            </button>

            {/* Microsoft Pill */}
            <button
              type="button"
              onClick={() => setActiveOAuth('microsoft')}
              className="w-full py-3 px-5 bg-[#17171c] hover:bg-[#202027] border border-slate-800/80 hover:border-slate-700 rounded-full text-xs font-semibold text-slate-100 flex items-center justify-center gap-3 transition duration-200 shadow-md"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              <span>Continue with Microsoft</span>
            </button>
          </div>

          {/* OR Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-800/80 w-full"></div>
            <span className="bg-[#0d0d11] px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest absolute">OR</span>
          </div>

          {/* Role Preset Quick Switcher */}
          <div className="p-2 bg-[#17171c] border border-slate-800/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-2 pt-1">
              <span>Select Account Role Preset:</span>
              <span className="text-pink-400 font-mono text-[10px]">Auto Fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleDemoSelect('Manager', 'eleanor@retail.com')}
                className={`py-2 px-3 rounded-xl transition flex items-center justify-between ${
                  selectedRole === 'Manager'
                    ? 'bg-purple-600/20 border border-purple-500/40 text-purple-300'
                    : 'bg-[#1e1e24] text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🏬 Store Manager</span>
                {selectedRole === 'Manager' && <Check className="w-3.5 h-3.5 text-purple-400" />}
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('Worker', 'sarah.worker@retailstore.com')}
                className={`py-2 px-3 rounded-xl transition flex items-center justify-between ${
                  selectedRole === 'Worker'
                    ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300'
                    : 'bg-[#1e1e24] text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>👷 Store Worker</span>
                {selectedRole === 'Worker' && <Check className="w-3.5 h-3.5 text-blue-400" />}
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="eleanor@retail.com"
                className="w-full px-4 py-3 bg-[#17171c] border border-slate-800 rounded-full text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#17171c] border border-slate-800 rounded-full text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Pill Button (Solid Light) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#e2e8f0] hover:bg-white text-slate-950 font-bold text-xs rounded-full shadow-lg transition duration-200 flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Continue'}</span>
            </button>
          </form>

          {/* Footer Registration Link */}
          <div className="text-center text-xs text-slate-400 pt-1">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="text-white hover:underline font-bold"
            >
              Create your account
            </button>
          </div>

          {/* Enterprise Lock Note */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-2">
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            <span>SSO available on Business and Enterprise plans</span>
          </div>

        </div>

        {/* RIGHT COLUMN: Lovable Vibrant Gradient Canvas with Floating Prompt Pill */}
        <div className="lg:col-span-7 h-full min-h-[580px] hidden lg:block">
          <div className="w-full h-full rounded-[32px] overflow-hidden relative shadow-2xl p-8 flex items-center justify-center bg-gradient-to-tr from-[#0a0a16] via-[#1b1035] to-[#2e0938] border border-slate-800/50">
            
            {/* Ultra Vibrant Soft Aura Mesh Blurs */}
            <div className="absolute top-[10%] right-[10%] w-[380px] h-[380px] bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 rounded-full blur-[100px] opacity-70 animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-[10%] left-[10%] w-[420px] h-[420px] bg-gradient-to-tr from-pink-600 via-purple-600 to-orange-500 rounded-full blur-[110px] opacity-80 animate-pulse pointer-events-none"></div>
            <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-gradient-to-tr from-magenta-500 to-rose-500 rounded-full blur-[90px] opacity-60 pointer-events-none"></div>

            {/* Floating Interactive AI Prompt Pill (Center of Canvas) */}
            <div className="relative z-10 w-full max-w-md bg-[#dce3f0]/95 backdrop-blur-2xl rounded-2xl py-3.5 px-5 shadow-2xl border border-white/40 flex items-center justify-between gap-3 transform hover:scale-[1.02] transition duration-300">
              <div className="flex items-center gap-1.5 text-slate-800 text-xs sm:text-sm font-medium overflow-hidden">
                <span>{aiPromptText}</span>
                <span className="w-0.5 h-4 bg-slate-800 animate-pulse inline-block shrink-0"></span>
              </div>

              <div className="w-9 h-9 rounded-full bg-[#18181b] text-white flex items-center justify-center shrink-0 shadow-lg cursor-pointer hover:bg-black transition">
                <ArrowUp className="w-4 h-4" />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Modals */}
      <OAuthModal
        provider={activeOAuth}
        isOpen={!!activeOAuth}
        onClose={() => setActiveOAuth(null)}
        role={selectedRole}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
    </div>
  );
}
