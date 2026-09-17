import React, { useState } from 'react';
import { ShieldCheck, User, CreditCard, Store, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail, validatePhone, validateEmployeeId, validatePassword, validateMatchingPasswords } from '../../utils/validators';
import OTPVerificationInput from '../../components/auth/OTPVerificationInput';
import OAuthModal from '../../components/auth/OAuthModal';

export default function ManagerRegister() {
  const { registerNewUser, loading } = useAuth();
  const navigate = useNavigate();

  const [activeOAuth, setActiveOAuth] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    storeId: 'Store #101 (Flagship Seattle)',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [error, setError] = useState('');

  const stores = [
    'Store #101 (Flagship Seattle)',
    'Store #102 (Downtown Austin)',
    'Store #103 (Westside San Francisco)',
    'Store #104 (SoHo New York)',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field Validations
    if (!formData.fullName.trim()) return setError('Full Name is required.');
    const empIdErr = validateEmployeeId(formData.employeeId);
    if (empIdErr) return setError(empIdErr);

    const emailErr = validateEmail(formData.email);
    if (emailErr) return setError(emailErr);

    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) return setError(phoneErr);

    if (!isEmailVerified) {
      return setError('Please verify your Email address using the 6-digit OTP code before completing registration.');
    }
    if (formData.phone && !isPhoneVerified) {
      return setError('Please verify your Phone number using the 6-digit OTP code before completing registration.');
    }

    const passErr = validatePassword(formData.password);
    if (passErr) return setError(passErr);

    const matchErr = validateMatchingPasswords(formData.password, formData.confirmPassword);
    if (matchErr) return setError(matchErr);

    const payload = {
      fullName: formData.fullName,
      employeeId: formData.employeeId,
      storeId: formData.storeId,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: 'Manager',
      authProvider: 'Email',
    };

    const res = await registerNewUser(payload);
    if (res.success) {
      navigate('/manager-dashboard');
    } else {
      setError(res.error || 'Manager registration failed.');
    }
  };


  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden my-8">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-black to-slate-950 pointer-events-none"></div>

      <div className="w-full max-w-lg bg-[#111827] border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        <Link
          to="/auth/manager/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Manager Login
        </Link>

        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Manager Account Registration</h2>
          <p className="text-xs text-slate-400">
            Create an active Store Manager profile to access AI operations and dashboards
          </p>
        </div>

        {/* Social Register Row */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
            Register via Social SSO
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

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-[#111827] px-3 text-[10px] text-slate-500 font-mono uppercase tracking-widest absolute">Or Manual Registration</span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Employee ID *</label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  placeholder="MGR-1042"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Assigned Store Location *</label>
            <div className="relative">
              <Store className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={formData.storeId}
                onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
              >
                {stores.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Company Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="eleanor@retail.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
                />
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
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
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


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 8 chars, 1 upper, 1 special"
                  className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
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
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Creating Manager Account...' : 'Complete Manager Registration'}
            {!loading && <CheckCircle2 className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already registered?{' '}
          <Link to="/auth/manager/login" className="text-purple-400 hover:underline font-bold">
            Sign In Here
          </Link>
        </div>

        <OAuthModal
          provider={activeOAuth}
          isOpen={!!activeOAuth}
          onClose={() => setActiveOAuth(null)}
          role="Manager"
        />
      </div>
    </div>
  );
}

