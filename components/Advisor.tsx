import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ExpenseItem, UserSettings } from '../types';
import { generateFinancialAdvice } from '../services/geminiService';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface AdvisorProps {
  expenses: ExpenseItem[];
  settings: UserSettings;
}

const Advisor: React.FC<AdvisorProps> = ({ expenses, settings }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hi ${settings.userName}! I'm your AI financial assistant. 🎓\n\nI can help you with:\n- Reducing your expenses\n- Finding the right student credit card\n- Basics of investing\n- Managing your student loans\n\nHow can I help you today?`
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const advice = await generateFinancialAdvice(userMsg.text, expenses, settings);

    const botMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'model',
      text: advice
    };

    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  const suggestions = [
    "How can I save more money?",
    "Best credit card for students?",
    "Explain investing simply",
    "Analyze my spending"
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100">Financial Advisor</h2>
            <p className="text-xs text-slate-400">Powered by Gemini AI</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div
                className={`p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start w-full">
            <div className="flex items-center space-x-2 bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 shadow-sm">
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length < 3 && !loading && (
        <div className="px-4 pb-2">
           <p className="text-xs text-slate-500 mb-2 font-medium ml-1">Suggested topics:</p>
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {suggestions.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => { setInput(s); handleSend(); }}
                  className="whitespace-nowrap px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-full text-xs text-slate-400 hover:bg-slate-800 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors"
                >
                  {s}
                </button>
              ))}
           </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-slate-900 p-4 border-t border-slate-800">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for advice..."
            className="flex-1 bg-slate-950 text-slate-200 placeholder-slate-600 border border-slate-800 rounded-full px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:bg-slate-900 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Advisor;