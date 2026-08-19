'use client';

import React, { useState } from 'react';
import { MessageSquare, Bot, User, Paperclip, Clock, Zap } from 'lucide-react';

interface Thread {
  id: string;
  customer: string;
  time: string;
  preview: string;
  status: string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
    tokens?: number;
    sources?: string[];
  }[];
}

export default function ConversationsPage() {
  const [threads] = useState<Thread[]>([
    {
      id: '1',
      customer: 'Visitor #9182 (Dallas, US)',
      time: '12 minutes ago',
      preview: 'What are your enterprise API rate limits and SLAs?',
      status: 'Resolved via Docs',
      messages: [
        {
          role: 'user',
          content: 'What are your enterprise API rate limits and SLAs?',
        },
        {
          role: 'assistant',
          content:
            'Our enterprise tier provides a 99.99% uptime SLA and supports up to 10,000 requests per minute with dedicated rate limit headroom. Tailored SLAs are available with custom dedicated clusters.',
          tokens: 310,
          sources: ['Company_Service_Pricing_2026.pdf (Page 4)'],
        },
      ],
    },
    {
      id: '2',
      customer: 'Visitor #9181 (London, UK)',
      time: '35 minutes ago',
      preview: 'Can I upload proprietary PDF technical manuals?',
      status: 'Resolved via Docs',
      messages: [
        {
          role: 'user',
          content: 'Can I upload proprietary PDF technical manuals?',
        },
        {
          role: 'assistant',
          content:
            'Yes! You can upload technical manuals, Markdown documentation, and PDFs. All documents are encrypted and indexed strictly under your tenant ID, completely isolated from all other organizations.',
          tokens: 240,
          sources: ['Platform_Architecture_Guide.md'],
        },
      ],
    },
  ]);

  const [selectedThread, setSelectedThread] = useState<Thread>(threads[0]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Conversations & Audits</h1>
        <p className="text-xs text-slate-500 mt-1">
          Inspect customer chat sessions, token usage metrics, and verified citations retrieved by the RAG orchestrator.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[560px]">
        {/* Left Column: Thread List */}
        <div className="md:col-span-5 border-r border-slate-100 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <span className="text-xs font-bold text-slate-900">All Sessions ({threads.length})</span>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
            {threads.map((t) => {
              const isSelected = selectedThread.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedThread(t)}
                  className={`w-full text-left p-4 transition-colors ${
                    isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">{t.customer}</span>
                    <span className="text-[10px] text-slate-400">{t.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1 italic mb-2">"{t.preview}"</p>
                  <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {t.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chat History & Citations */}
        <div className="md:col-span-7 flex flex-col justify-between bg-slate-50/20">
          <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900">{selectedThread.customer}</h3>
              <p className="text-[10px] text-slate-400">Session ID: sess_{selectedThread.id}_live_prod</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-semibold">
              gpt-4o-mini
            </span>
          </div>

          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            {selectedThread.messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className="max-w-[80%] space-y-1.5">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {m.content}
                  </div>

                  {m.sources && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Retrieved Sources:
                      </span>
                      {m.sources.map((src, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-[11px] font-medium"
                        >
                          <Paperclip className="h-3 w-3 text-indigo-500" />
                          <span>{src}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {m.tokens && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Zap className="h-3 w-3 text-amber-500" />
                      <span>{m.tokens} tokens consumed</span>
                    </div>
                  )}
                </div>
                {m.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 bg-white border-t border-slate-100 text-[11px] text-slate-400 text-center font-medium">
            Read-only conversation log • Multi-tenant audit trail
          </div>
        </div>
      </div>
    </div>
  );
}
