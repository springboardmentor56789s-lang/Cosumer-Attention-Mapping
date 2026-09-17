import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send, Key, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { sendCopilotMessage } from '../../services/copilotApi';
import ChatMessage from '../copilot/ChatMessage';
import LoadingMessage from '../copilot/LoadingMessage';

export default function AIAssistantDrawer({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('RETAIL_AI_API_KEY') || '');
  const [provider, setProvider] = useState(() => localStorage.getItem('RETAIL_AI_PROVIDER') || 'backend_engine');
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [keySavedMessage, setKeySavedMessage] = useState('');
  const [conversationId] = useState(() => 'session_' + Math.random().toString(36).substring(2, 9));

  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'ai',
      text: 'Hello! I am your **AI Retail Vision Copilot**. Ask me anything about store footfall, shelf attention fixations, customer dwell times, or optimization recommendations.',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('RETAIL_AI_API_KEY', apiKey);
    }
  }, [apiKey]);

  const saveApiKey = (e) => {
    e.preventDefault();
    localStorage.setItem('RETAIL_AI_API_KEY', apiKey);
    localStorage.setItem('RETAIL_AI_PROVIDER', provider);
    setKeySavedMessage('Copilot settings saved successfully!');
    setTimeout(() => setKeySavedMessage(''), 3000);
    setShowKeyConfig(false);
  };

  if (!isOpen) return null;

  const handleSendQuery = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg = { id: 'u-' + Date.now(), sender: 'user', text: textToSend, timestamp: 'Just now' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Call backend AI Copilot Service with conversation memory
      const response = await sendCopilotMessage({
        message: textToSend,
        storeId: 101,
        videoId: 1,
        conversationId,
      });

      const aiMsg = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: response.answer || 'Response generated from store vision telemetry.',
        timestamp: 'Just now',
        payload: response,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error fetching Copilot response:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-err-' + Date.now(),
          sender: 'ai',
          text: 'Sorry, I encountered an issue retrieving real-time store telemetry. Please check backend server status.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendQuery(input);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0F1420] border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  AI Retail Vision Copilot
                  <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] rounded font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Live Engine
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Natural Language Intelligence Analyst</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded-lg transition"
                title="Configure Copilot Settings"
              >
                <Key className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Config Drawer Header */}
          {showKeyConfig && (
            <form onSubmit={saveApiKey} className="p-4 bg-slate-900 border-b border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-200">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <ShieldCheck className="w-4 h-4" /> Copilot Engine Settings
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{conversationId}</span>
              </div>

              <div className="space-y-2">
                <label className="block text-slate-400">Analytics Provider:</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                >
                  <option value="backend_engine">Native Vision Telemetry Engine (Empirical)</option>
                  <option value="openai">OpenAI (gpt-4o-mini)</option>
                  <option value="gemini">Google Gemini</option>
                </select>

                {provider !== 'backend_engine' && (
                  <>
                    <label className="block text-slate-400">API Key Secret *</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-... or AIza..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
                    />
                  </>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition"
              >
                Save Settings
              </button>
            </form>
          )}

          {keySavedMessage && (
            <div className="p-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-xs text-center font-semibold">
              {keySavedMessage}
            </div>
          )}

          {/* Quick Prompt Suggestions */}
          <div className="p-2.5 border-b border-slate-800/80 bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
            <button
              onClick={() => handleSendQuery('What is the live update of the store?')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg whitespace-nowrap transition border border-slate-700/50"
            >
              Live Update
            </button>
            <button
              onClick={() => handleSendQuery('Which shelf has the highest attention?')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg whitespace-nowrap transition border border-slate-700/50"
            >
              Top Attention Shelf
            </button>
            <button
              onClick={() => handleSendQuery('How long did shoppers spend there?')}
              className="px-2.5 py-1 bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 rounded-lg whitespace-nowrap transition border border-purple-500/30 font-medium"
              title="Follow-up context test"
            >
              How long there?
            </button>
            <button
              onClick={() => handleSendQuery('Show peak hour recommendations')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg whitespace-nowrap transition border border-slate-700/50"
            >
              Recommendations
            </button>
            <button
              onClick={() => handleSendQuery('What is customer conversion rate and revenue?')}
              className="px-2.5 py-1 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 rounded-lg whitespace-nowrap transition border border-amber-500/30"
              title="Anti-hallucination check"
            >
              Conversion & Revenue
            </button>
          </div>

          {/* Chat Messages */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}

            {loading && <LoadingMessage />}
          </div>

          {/* Footer Input */}
          <form onSubmit={handleFormSubmit} className="p-3 border-t border-slate-800 bg-slate-950/80">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about shelf attention, dwell, or recommendations..."
                className="w-full pl-3 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 p-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
