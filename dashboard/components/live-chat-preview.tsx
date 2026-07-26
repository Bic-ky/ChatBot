'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, Paperclip } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export function LiveChatPreview() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your AI business assistant. How can I help you with your services or pricing today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Simulate RAG + LangGraph response
    setTimeout(() => {
      let botResponse = `I found information in your uploaded documentation regarding "${userText}". We offer multi-tenant isolation, automated document indexing, and 24/7 autonomous resolution with verifiable citations.`;
      if (userText.toLowerCase().includes('price') || userText.toLowerCase().includes('cost')) {
        botResponse = 'Our plans start at $49/month for small businesses with up to 2 assistants and 100k vector tokens. Enterprise plans offer custom LLM fine-tuning and dedicated SLA support.';
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: botResponse,
        sources: ['Product_FAQ.pdf (Page 2)', 'Service_Terms.md'],
      };
      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 700);
  };

  const handleReset = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I am your AI business assistant. How can I help you with your services or pricing today?',
      },
    ]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
      {/* Chat header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Live Assistant Preview</h4>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-medium">Ready (gpt-4o-mini)</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleReset}
          title="Reset conversation"
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-white transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/30">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 text-xs">
                <Bot className="h-3.5 w-3.5" />
              </div>
            )}
            <div className="max-w-[85%] space-y-1">
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-sm'
                }`}
              >
                {m.content}
              </div>

              {m.sources && m.sources.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {m.sources.map((src, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium"
                    >
                      <Paperclip className="h-2.5 w-2.5 text-slate-400" />
                      {src}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {m.role === 'user' && (
              <div className="h-7 w-7 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-xs">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 items-center text-xs text-slate-400 pl-9">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
            <span>Searching knowledge base & drafting response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-sm"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
