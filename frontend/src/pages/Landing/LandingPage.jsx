import React from 'react';
import { ShieldCheck, HardHat, Sparkles, ArrowRight, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/20 via-black to-blue-950/20 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg bg-[#111827] border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-8 text-center">
        {/* Brand Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> RetaiLVision AI Enterprise Platform
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Smart Retail Platform
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Secure, role-based spatial intelligence & store operations system. Select your account type to proceed.
          </p>
        </div>

        {/* 2-Role Login Selection Paths */}
        <div className="space-y-3 pt-2">
          {/* Manager Login Entry Button */}
          <Link
            to="/auth/manager/login"
            className="w-full p-4 bg-gradient-to-r from-purple-950/80 to-slate-900 hover:from-purple-900/90 hover:to-slate-800 border border-purple-500/30 hover:border-purple-500/60 rounded-2xl transition flex items-center justify-between group shadow-lg"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                  Manager Login
                </div>
                <div className="text-xs text-slate-400">
                  Store Operations, Analytics, AI Recommendations & Task Assignment
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition shrink-0" />
          </Link>

          {/* Worker Login Entry Button */}
          <Link
            to="/auth/worker/login"
            className="w-full p-4 bg-gradient-to-r from-blue-950/80 to-slate-900 hover:from-blue-900/90 hover:to-slate-800 border border-blue-500/30 hover:border-blue-500/60 rounded-2xl transition flex items-center justify-between group shadow-lg"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                <HardHat className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-blue-300 transition">
                  Worker Login
                </div>
                <div className="text-xs text-slate-400">
                  Store Task Execution, Evidence Uploads & Shift Dwell Logs
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition shrink-0" />
          </Link>
        </div>

        {/* Registration Prompt Section */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-400">
            Don't have an account? Every user must register.
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <Link
              to="/auth/manager/register"
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-purple-300 font-bold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" /> Register Manager
            </Link>

            <Link
              to="/auth/worker/register"
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-blue-500/30 text-blue-300 font-bold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" /> Register Worker
            </Link>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-500 pt-2">
          Strict RBAC Validation Engine v2.0
        </div>
      </div>
    </div>
  );
}
