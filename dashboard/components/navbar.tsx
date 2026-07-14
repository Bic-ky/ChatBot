'use client';

import React from 'react';
import { Bell, Search, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search knowledge, conversations, assistants..."
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-[11px] font-medium text-emerald-700">Tenant Isolated</span>
        </div>

        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <span>API Docs</span>
          <ExternalLink className="h-3 w-3" />
        </a>

        <div className="h-4 w-px bg-slate-200" />

        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-indigo-600 rounded-full" />
        </button>
      </div>
    </header>
  );
}
