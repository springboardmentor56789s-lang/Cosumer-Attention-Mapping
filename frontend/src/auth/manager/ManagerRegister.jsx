import React, { useState } from 'react';
import { ShieldCheck, User, CreditCard, Store, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail, validatePhone, validateEmployeeId, validatePassword, validateMatchingPasswords } from '../../utils/validators';
import OTPVerificationInput from '../../components/auth/OTPVerificationInput';


export default function ManagerRegister() {
  const { registerNewUser, loading } = useAuth();
  const navigate = useNavigate();

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
      </div>
    </div>
  );
}

