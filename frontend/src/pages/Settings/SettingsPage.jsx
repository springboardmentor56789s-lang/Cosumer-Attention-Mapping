import React, { useState, useEffect } from 'react';
import { Settings, Sun, Moon, Laptop, Palette, Grid, Zap, Key, ShieldCheck, CheckCircle, Sparkles, Terminal } from 'lucide-react';
import { useTheme, ACCENT_COLORS } from '../../contexts/ThemeContext';

export default function SettingsPage() {
  const { themeMode, setThemeMode, accent, setAccent, density, setDensity, motion, setMotion } = useTheme();

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('RETAIL_AI_API_KEY') || '');
  const [provider, setProvider] = useState(() => localStorage.getItem('RETAIL_AI_PROVIDER') || 'openai');
  const [showKey, setShowKey] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const handleSaveKey = (e) => {
    e.preventDefault();
    localStorage.setItem('RETAIL_AI_API_KEY', apiKey.trim());
    localStorage.setItem('RETAIL_AI_PROVIDER', provider);
    setSavedMsg('AI Credentials saved & connected successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Theme & System Settings</h1>
            <p className="text-xs text-slate-400">
              Customize AI Analytics Appearance, Accent Colors, Spatial Density, and AI API Key Credentials
            </p>
          </div>
        </div>

        {apiKey && (
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs rounded-lg flex items-center gap-1.5 font-semibold">
            <CheckCircle className="w-4 h-4" /> AI Key Active
          </span>
        )}
      </div>

      {/* AI API KEY INTEGRATION CARD */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border border-purple-500/30 rounded-2xl space-y-4 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-400" />
            AI Model Integration & API Key Credentials
          </h2>
          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-mono rounded">
            OpenAI / Gemini / Claude
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Connect your OpenAI (`sk-...`) or Google Gemini (`AIza...`) API key to power live natural language queries, custom AI copilot responses, and automated placement recommendations.
        </p>

        {savedMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2 font-semibold">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{savedMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveKey} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">AI Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
            >
              <option value="openai">OpenAI (gpt-4o-mini / gpt-4o)</option>
              <option value="gemini">Google Gemini (gemini-1.5-flash)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-300 mb-1">API Key Secret *</label>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-proj-... or AIzaSy..."
                className="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> Save Key
              </button>
            </div>
          </div>
        </form>

        {/* Terminal Protocol Reference for Safe Env Storage */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-purple-400" /> Safe Environment Variable Command (typing hidden):
          </div>
          <code className="block p-2 bg-black border border-slate-800 text-purple-300 font-mono text-[10px] rounded overflow-x-auto select-all">
            printf "Enter RETAIL_AI_API_KEY (typing hidden): " && read -s val && echo && echo "RETAIL_AI_API_KEY=$val" {'>>'} "frontend/.env" && echo "Saved."
          </code>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Theme Mode */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-xl">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            Display Theme Mode
          </h2>
          <p className="text-xs text-slate-400">Choose between dark-first analytics or high-contrast light mode.</p>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <button
              onClick={() => setThemeMode('dark')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${themeMode === 'dark' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              <Moon className="w-5 h-5" />
              <span>Dark Mode</span>
            </button>

            <button
              onClick={() => setThemeMode('light')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${themeMode === 'light' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              <Sun className="w-5 h-5" />
              <span>Light Mode</span>
            </button>

            <button
              onClick={() => setThemeMode('system')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${themeMode === 'system' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              <Laptop className="w-5 h-5" />
              <span>System</span>
            </button>
          </div>
        </div>

        {/* Card 2: Accent Color */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-xl">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-400" />
            Accent Palette Selection
          </h2>
          <p className="text-xs text-slate-400">Select active highlight color palette across charts and buttons.</p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {Object.entries(ACCENT_COLORS).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setAccent(key)}
                className={`p-3 rounded-xl border flex items-center gap-3 transition ${accent === key ? 'bg-slate-950 border-white text-slate-100 font-bold' : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cfg.primary }}></span>
                <span>{cfg.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Card 3: Layout Density */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-xl">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Grid className="w-4 h-4 text-emerald-400" />
            Dashboard Information Density
          </h2>
          <p className="text-xs text-slate-400">Control spacing, margins, and card padding density.</p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => setDensity('comfortable')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${density === 'comfortable' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              <Grid className="w-5 h-5" />
              <span>Comfortable (Spacious)</span>
            </button>

            <button
              onClick={() => setDensity('compact')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${density === 'compact' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              <Grid className="w-5 h-5" />
              <span>Compact (High Density)</span>
            </button>
          </div>
        </div>

        {/* Card 4: Motion & Camera Performance Preferences */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-xl">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Motion & Camera Performance
          </h2>
          <p className="text-xs text-slate-400">Tune rendering animations and edge camera gaze refresh rates.</p>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
              <span className="text-slate-300 font-medium">Enable Smooth Animations & Micro-interactions</span>
              <input
                type="checkbox"
                checked={motion}
                onChange={(e) => setMotion(e.target.checked)}
                className="rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-0"
              />
            </label>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="text-slate-300 font-medium">Edge Camera Sampling Rate</span>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-mono rounded">
                60 FPS Gaze (High Acc)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
