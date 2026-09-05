import React, { useState } from 'react';
import { Mail, Lock, User, Building, ShieldCheck, X, Check, Eye, EyeOff, AlertCircle, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import OTPVerificationInput from './OTPVerificationInput';

export default function RegisterModal({ isOpen, onClose }) {
  const { registerNewUser } = useAuth();
  const navigate = useNavigate();

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
      </div>
    </div>
  );
}
