import React, { useState } from 'react';
import { HardHat, User, CreditCard, Store, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail, validatePhone, validateEmployeeId, validatePassword, validateMatchingPasswords } from '../../utils/validators';
import OTPVerificationInput from '../../components/auth/OTPVerificationInput';

export default function WorkerRegister() {
  const { registerNewUser, loginWorkerGoogle, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    assignedStore: 'Store #101 (Flagship Seattle)',
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
      assignedStore: formData.assignedStore,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: 'Worker',
      authProvider: 'Email',
    };

    const res = await registerNewUser(payload);
    if (res.success) {
      navigate('/worker-dashboard');
    } else {
      setError(res.error || 'Worker registration failed.');
    }
  };


  const handleGoogleRegister = async () => {
    setError('');
    const res = await loginWorkerGoogle();
    if (res.success) {
      navigate('/worker-dashboard');
    } else {
      setError(res.error || 'Google registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden my-8">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-black to-slate-950 pointer-events-none"></div>

      <div className="w-full max-w-lg bg-[#111827] border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        <Link
          to="/auth/worker/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Worker Login
        </Link>

        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-lg">
            <HardHat className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Worker Account Registration</h2>
          <p className="text-xs text-slate-400">
            Create an active Store Employee account to accept assigned shelf tasks
          </p>
        </div>

        {/* Google Registration Option */}
        <button
          type="button"
          onClick={handleGoogleRegister}
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
          <span>Quick Register with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-[#111827] px-3 text-[10px] text-slate-500 font-mono uppercase">Or Standard Registration</span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
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
                  placeholder="Sarah Connor"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
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
                  placeholder="EMP-2041"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Assigned Store Location *</label>
            <div className="relative">
              <Store className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={formData.assignedStore}
                onChange={(e) => setFormData({ ...formData, assignedStore: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
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
              <label className="block font-semibold text-slate-300 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sarah.worker@store.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
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
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
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
                  className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
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
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Creating Worker Account...' : 'Complete Worker Registration'}
            {!loading && <CheckCircle2 className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already registered?{' '}
          <Link to="/auth/worker/login" className="text-blue-400 hover:underline font-bold">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
