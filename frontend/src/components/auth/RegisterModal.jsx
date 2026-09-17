import React, { useState } from 'react';
import { Mail, Lock, User, Building, ShieldCheck, X, Check, Eye, EyeOff, AlertCircle, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import OTPVerificationInput from './OTPVerificationInput';
import OAuthModal from './OAuthModal';

export default function RegisterModal({ isOpen, onClose }) {
  const { registerNewUser } = useAuth();
  const navigate = useNavigate();

  const [activeOAuth, setActiveOAuth] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    organization: '',
    role: 'Retail Analyst',
    termsAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', width: 'w-1/4' };
    if (score === 2 || score === 3) return { score: 2, label: 'Medium', color: 'bg-amber-500', width: 'w-2/4' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  const strength = calculatePasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isEmailVerified) {
      setError('Please verify your Email address using the 6-digit OTP code before completing registration.');
      return;
    }
    if (formData.phone && !isPhoneVerified) {
      setError('Please verify your Phone number using the 6-digit OTP code before completing registration.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.termsAccepted) {
      setError('You must accept the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);
    const payload = {
      ...formData,
      employeeId: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
    };
    const res = await registerNewUser(payload);
    setLoading(false);
    if (res.success) {
      onClose();
      navigate('/');
    } else {
      setError(res.error || res.message || 'Registration failed');
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#131927] border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Create RetaiLVision Account</h2>
            <p className="text-xs text-slate-400">Join the AI Consumer Attention Intelligence Platform</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Social OAuth Register Row */}
          <div className="space-y-2 pb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
              Quick Register with Social OAuth
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveOAuth('google')}
                className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow transition"
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
                type="button"
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
                type="button"
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

          <div className="relative flex items-center justify-center py-1">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-[#131927] px-3 text-[10px] text-slate-500 uppercase font-mono tracking-widest absolute">Or Form Registration</span>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Eleanor Vance"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Work Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="eleanor@retailstore.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Phone Number *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* OTP Verification Sections */}
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <OTPVerificationInput
              target={formData.email}
              channel="email"
              onVerified={() => setIsEmailVerified(true)}
              label="Verify Email via OTP *"
              buttonText="Send Email OTP"
            />
            <div className="border-t border-slate-800/80"></div>
            <OTPVerificationInput
              target={formData.phone}
              channel="phone"
              onVerified={() => setIsPhoneVerified(true)}
              label="Verify Phone Number via OTP *"
              buttonText="Send Phone OTP"
            />
          </div>



          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Organization Name</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Apex Superstores"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Platform Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Admin">Admin (Full Control)</option>
                <option value="Store Manager">Store Manager</option>
                <option value="Retail Analyst">Retail Analyst</option>
                <option value="Marketing Manager">Marketing Manager</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {formData.password && (
                <div className="mt-1.5 space-y-1">
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`}></div>
                  </div>
                  <span className="text-[10px] text-slate-400">Strength: <strong className="text-slate-200">{strength.label}</strong></span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <label className="flex items-start gap-2 pt-2 cursor-pointer text-slate-400 text-[11px]">
            <input
              type="checkbox"
              required
              checked={formData.termsAccepted}
              onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
              className="mt-0.5 rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-0"
            />
            <span>
              I agree to the <a href="#terms" onClick={(e) => e.preventDefault()} className="text-blue-400 hover:underline">Terms of Service</a> and <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-blue-400 hover:underline">Privacy Policy</a>.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Complete Registration & Access Dashboard'}</span>
          </button>
        </form>

        <OAuthModal
          provider={activeOAuth}
          isOpen={!!activeOAuth}
          onClose={() => setActiveOAuth(null)}
          role={formData.role || 'Retail Analyst'}
        />
      </div>
    </div>
  );
}
