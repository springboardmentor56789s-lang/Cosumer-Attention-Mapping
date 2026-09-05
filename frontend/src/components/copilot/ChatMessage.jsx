import React from 'react';
import { Bot, User } from 'lucide-react';
import InsightCard from './InsightCard';
import EvidenceCard from './EvidenceCard';

export default function ChatMessage({ message }) {
  const { sender, text, timestamp, payload } = message;

  // Simple formatter to convert markdown **bold** to bold text elements
  const formatText = (content) => {
    if (!content) return null;
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`flex gap-3 ${sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      {sender === 'ai' && (
        <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5 shadow-sm">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div
        className={`max-w-[88%] p-3.5 rounded-2xl text-slate-100 leading-relaxed text-xs ${
          sender === 'user'
            ? 'bg-blue-600 text-white rounded-br-none shadow-md font-medium'
            : 'bg-slate-900 border border-slate-800 rounded-bl-none shadow-sm'
        }`}
      >
        <div className="whitespace-pre-line">{formatText(text)}</div>

        {/* Structured Payloads for AI Messages */}
        {sender === 'ai' && payload && (
          <>
            <InsightCard type={payload.type} data={payload.data} />
            <EvidenceCard
              evidence={payload.evidence}
              confidence={payload.confidence}
              actionLink={payload.action_link}
              type={payload.type}
            />
          </>
        )}

        <span className="text-[9px] text-slate-400 mt-1.5 block text-right font-mono opacity-80">
          {timestamp}
        </span>
      </div>

      {sender === 'user' && (
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
