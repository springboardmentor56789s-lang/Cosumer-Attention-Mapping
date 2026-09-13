import React, { useState } from 'react';
import { User, Mail, Lock, Building, ShieldCheck, Key, Globe, Smartphone, Laptop, CheckCircle2, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile, toggleConnectedAccount } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || 'Eleanor Vance');
  const [email, setEmail] = useState(user?.email || 'admin@retailai.com');
  const [organization, setOrganization] = useState(user?.organization || 'Aether Retail Global');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ text: '', type: '' });

  const [activeSessions, setActiveSessions] = useState([
    { id: 'sess-1', device: 'Chrome on Windows 11 (Current)', ip: '192.168.1.104', location: 'Seattle, USA', lastActive: 'Active Now' },
    { id: 'sess-2', device: 'Safari on iPhone 15 Pro', ip: '172.56.21.89', location: 'Austin, USA', lastActive: '2 hours ago' },
  ]);

  const loginHistory = [
    { id: 'lh-1', timestamp: '2026-07-30 04:45:12', method: 'OAuth (Google)', ip: '192.168.1.104', status: 'Success' },
    { id: 'lh-2', timestamp: '2026-07-29 18:22:04', method: 'Password JWT', ip: '192.168.1.104', status: 'Success' },
    { id: 'lh-3', timestamp: '2026-07-28 11:04:50', method: 'OAuth (Microsoft)', ip: '172.56.21.89', status: 'Success' },
  ];

  const handleUpdateInfo = (e) => {
    e.preventDefault();
    updateProfile({ full_name: fullName, email, organization });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    setPwdMsg({ text: 'Password updated successfully.', type: 'success' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleRevokeSession = (id) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const connected = user?.connectedAccounts || { google: true, microsoft: false, github: false };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Header Banner */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-4 backdrop-blur-xl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg">
          {fullName.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            {fullName}
            <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs rounded-full font-medium">
              {user?.role || 'Admin'}
            </span>
          </h1>
          <p className="text-xs text-slate-400">{email} • {organization}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Edit Info & Password (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Personal Info Card */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-xl">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              Edit Personal Profile
            </h2>

            {saveSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleUpdateInfo} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Organization Name</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition"
              >
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-xl">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              Security & Change Password
            </h2>

            {pwdMsg.text && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${pwdMsg.type === 'error' ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>
                {pwdMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Connected Accounts & Active Sessions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Connected Provider Accounts */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-xl">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Connected Single Sign-On Accounts
            </h2>

            <div className="space-y-3 text-xs">
              {/* Google */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google SSO</span>
                </div>
                <button
                  onClick={() => toggleConnectedAccount('google')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${connected.google ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}
                >
                  {connected.google ? 'Connected' : 'Connect'}
                </button>
              </div>

              {/* Microsoft */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H1z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  <span>Microsoft Azure AD</span>
                </div>
                <button
                  onClick={() => toggleConnectedAccount('microsoft')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${connected.microsoft ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}
                >
                  {connected.microsoft ? 'Connected' : 'Connect'}
                </button>
              </div>

              {/* GitHub */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub Enterprise</span>
                </div>
                <button
                  onClick={() => toggleConnectedAccount('github')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${connected.github ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}
                >
                  {connected.github ? 'Connected' : 'Connect'}
                </button>
              </div>
            </div>
          </div>

          {/* Active Device Sessions */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-xl">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-purple-400" />
              Active Devices & Sessions
            </h2>

            <div className="space-y-3 text-xs">
              {activeSessions.map((sess) => (
                <div key={sess.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">{sess.device}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{sess.ip} • {sess.location}</div>
                  </div>
                  <button
                    onClick={() => handleRevokeSession(sess.id)}
                    className="p-1 text-rose-400 hover:bg-rose-500/10 rounded transition"
                    title="Revoke session"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Login Audit Trail */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-xl">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Recent Login History
            </h2>

            <div className="space-y-2 text-[11px] font-mono">
              {loginHistory.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-950/60 rounded-lg flex items-center justify-between text-slate-400">
                  <div>
                    <div className="text-slate-200 font-semibold">{log.method}</div>
                    <div className="text-[9px]">{log.timestamp}</div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] rounded">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
