'use client';

import React from 'react';
import { BarChart3, TrendingUp, Users, MessageSquare, DollarSign, ArrowUpRight } from 'lucide-react';

export default function AnalyticsPage() {
  const stats = [
    { label: 'Token Consumption (Last 30d)', value: '1,420,500', sub: '~$2.13 total estimated cost' },
    { label: 'Autonomous Resolution Rate', value: '89.2%', sub: '+3.5% vs previous month' },
    { label: 'Total Customer Inquiries', value: '4,892', sub: 'Across 3 configured assistants' },
    { label: 'Average Citation Relevance', value: '94.8%', sub: 'Based on semantic similarity' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Analytics & Usage</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor customer interaction volume, token costs, and automated resolution rates.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-[11px] font-semibold text-slate-500">{s.label}</span>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{s.value}</p>
            <p className="text-[10px] text-slate-400 font-medium">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Breakdown Chart Placeholder */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Query Volume by Assistant (Last 7 Days)</h3>
        <div className="h-48 flex items-end gap-3 pt-6 border-b border-slate-100">
          {[40, 65, 52, 85, 92, 78, 95].map((height, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div
                style={{ height: `${height}%` }}
                className="w-full bg-indigo-500 rounded-t-lg transition-all hover:bg-indigo-600"
              />
              <span className="text-[10px] text-slate-400 font-medium">Day {idx + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
