'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RefreshCw,
  Bot,
  User,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: string;
}

const QUICK_PROMPTS = [
  'How does multi-tenant data isolation work?',
  'How do I ingest PDF and Markdown documents?',
  'Tell me about enterprise pricing & SLA',
  'What LLM models are supported?',
];

export function FloatingDemoChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        "Hello! I am your AI Business Assistant demo. Ask me about our multi-tenant architecture, vector knowledge ingestion, or enterprise security guarantees.",
      sources: ['Enterprise Overview', 'SOC2 Compliance Guide'],
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping]);

  // Handle ESC key to close modal for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend || inputMessage).trim();
    if (!messageText || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Attempt call to backend public chat endpoint
      const res = await fetch('http://localhost:8000/api/v1/public/assistants/default/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.response || data.reply,
            sources: data.sources?.map((s: any) => s.title || s) || ['Verified Knowledge Base'],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error('Backend offline');
      }
    } catch {
      // Intelligent fallback responses for demonstration
      await new Promise((resolve) => setTimeout(resolve, 800));
      let reply = `Thank you for asking about "${messageText}". In our production platform, each customer query runs through LangGraph semantic routing, retrieves relevant pgvector embeddings, and provides citation-backed answers with strict tenant boundaries.`;
      let sources = ['Multi-Tenant Architecture Whitepaper', 'RAG Retrieval Engine Spec'];

      if (messageText.toLowerCase().includes('multi-tenant') || messageText.toLowerCase().includes('isolation')) {
        reply =
          'Every tenant in our platform has strict row-level separation with foreign keys linked to tenant_id on all models (Assistants, Knowledge Bases, Documents, and Conversations). PostgreSQL pgvector queries are strictly filtered by tenant_id, preventing cross-tenant data leakage.';
        sources = ['Security Architecture Sec 3.1', 'PostgreSQL Tenant Isolation Policy'];
      } else if (messageText.toLowerCase().includes('pdf') || messageText.toLowerCase().includes('markdown') || messageText.toLowerCase().includes('ingest')) {
        reply =
          'Our document ingestion engine supports PDF, Markdown, and raw text. Uploaded documents are automatically hashed with SHA-256 for deduplication, split into 500-character overlapping chunks, embedded into 1536-dimensional vectors, and indexed in pgvector.';
        sources = ['Knowledge Base Ingestion Guide', 'Document Chunking Specifications'];
      } else if (messageText.toLowerCase().includes('pricing') || messageText.toLowerCase().includes('sla') || messageText.toLowerCase().includes('cost')) {
        reply =
          'We offer Starter ($49/mo, 10k messages), Pro ($199/mo, 50k messages, custom domains), and Enterprise (custom volume, dedicated VPC, custom SLA, and SSO). All tiers include continuous auto-vectorization and RBAC.';
        sources = ['SaaS Pricing Tiers', 'Enterprise SLA Agreement'];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: reply,
          sources,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Conversation cleared. How else may I assist you today?',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <aside
      aria-label="Floating AI Support Assistant"
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
    >
      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-heading"
          className="mb-4 flex h-[580px] w-[390px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-5"
        >
          {/* Header */}
          <header className="flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-blue-700 to-indigo-700 px-4 py-3.5 text-white">
            <div className="flex items-center space-x-3">
              <div
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur"
                aria-hidden="true"
              >
                <Bot className="h-5 w-5 text-white" />
                <span
                  className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-blue-700"
                  title="Assistant Online"
                />
              </div>
              <div>
                <h2 id="chat-heading" className="text-sm font-semibold text-white">
                  AI Business Assistant
                </h2>
                <p className="flex items-center text-xs text-blue-100/80">
                  <ShieldCheck className="mr-1 h-3 w-3 text-emerald-300" /> Enterprise Demo
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear chat history"
                title="Clear chat history"
                className="rounded-lg p-1.5 text-blue-100 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close demo chat modal"
                title="Close (Esc)"
                className="rounded-lg p-1.5 text-blue-100 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Messages Feed */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/70"
            role="log"
            aria-live="polite"
            aria-atomic="false"
            aria-label="Chat messages"
          >
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end space-x-2 max-w-[85%]">
                    {!isUser && (
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white"
                        aria-hidden="true"
                      >
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-bl-xs'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>

                  {/* Citation badges */}
                  {m.sources && m.sources.length > 0 && (
                    <div
                      className="mt-1.5 flex flex-wrap gap-1 pl-8"
                      aria-label="Information sources"
                    >
                      {m.sources.map((src, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-md bg-blue-950/80 px-2 py-0.5 text-[10px] font-medium text-blue-300 border border-blue-800/50"
                        >
                          📄 {src}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-500 mt-1 px-1">
                    {m.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center space-x-2 pl-2 text-slate-400">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white"
                  aria-hidden="true"
                >
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div
                  className="flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2"
                  aria-label="Assistant is typing"
                >
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div
              className="border-t border-slate-800/80 bg-slate-900/90 px-3 py-2"
              aria-label="Suggested questions"
            >
              <p className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center">
                <Sparkles className="h-3 w-3 mr-1 text-blue-400" /> Suggested questions:
              </p>
              <div className="flex flex-wrap gap-1">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="rounded-full bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] text-slate-300 transition-colors border border-slate-700/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-slate-800 bg-slate-900 p-3"
          >
            <label htmlFor="demo-chat-input" className="sr-only">
              Type your question
            </label>
            <input
              id="demo-chat-input"
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about the platform..."
              disabled={isTyping}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              aria-label="Send question"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={isOpen ? 'Close interactive demo chat' : 'Open interactive demo chat'}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/50"
      >
        <span
          className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center"
          aria-hidden="true"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
        </span>

        {isOpen ? (
          <ChevronDown className="h-6 w-6 transition-transform group-hover:translate-y-0.5" />
        ) : (
          <MessageSquare className="h-6 w-6 transition-transform group-hover:scale-110" />
        )}
      </button>
    </aside>
  );
}
