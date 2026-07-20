'use client';

import React from 'react';
import {
  Bot,
  MessageSquare,
  Zap,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { LiveChatPreview } from '@/components/live-chat-preview';
import { useAuth } from '@/lib/auth-context';

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  const metrics = [
    {
      title: 'Total Conversations',
      value: '1,429',
      change: '+18.2%',
      icon: MessageSquare,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Autonomous Deflection',
      value: '88.4%',
      change: '+4.1%',
      icon: Zap,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Avg. Response Time',
      value: '0.84s',
      change: '-120ms',
      icon: Clock,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      title: 'Indexed Vector Chunks',
      value: '3,812',
      change: '+450 docs',
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  const recentChats = [
    {
      id: '1',
      customer: 'Visitor from US (#9182)',
      snippet: 'What are your enterprise API rate limits and SLAs?',
      status: 'Resolved via Docs',
      time: '3m ago',
      tokens: '310 tokens',
    },
    {
      id: '2',
      customer: 'Visitor from UK (#9181)',
      snippet: 'Can I upload proprietary PDF technical manuals?',
      status: 'Resolved via Docs',
      time: '14m ago',
      tokens: '240 tokens',
    },
    {
      id: '3',
      customer: 'Visitor from DE (#9180)',
      snippet: 'I need to speak with a human support agent.',
      status: 'Handoff Triggered',
      time: '29m ago',
      tokens: '185 tokens',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.tenant?.name || 'Partner'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
              System Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Your knowledge base is synchronized. Assistants are currently handling customer inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/dashboard/assistants"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Bot className="h-4 w-4" />
            <span>Manage Assistants</span>
          </a>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{m.title}</span>
                <div className={`p-2 rounded-xl ${m.bg} ${m.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {m.value}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                  {m.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content: Split View between Recent Activity and Live Interactive Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Recent Activity & Architecture Status */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Customer Inquiries</h3>
              <a
                href="/dashboard/conversations"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="divide-y divide-slate-100">
              {recentChats.map((chat) => (
                <div key={chat.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-900">{chat.customer}</p>
                    <p className="text-xs text-slate-600 italic">"{chat.snippet}"</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <span>{chat.time}</span>
                      <span>•</span>
                      <span>{chat.tokens}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      chat.status.includes('Handoff')
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {chat.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tenant Isolation Status Box */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Multi-Tenant Row-Level Security Active</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every vector query, document chunk, and chat session is filtered strictly by{' '}
              <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">
                tenant_id: {user?.tenant?.id ? `${user.tenant.id.slice(0, 8)}...` : 'active'}
              </code>
              . Cross-tenant data leakage is structurally impossible.
            </p>
          </div>
        </div>

        {/* Right Side: Live Interactive Chat Playground */}
        <div className="lg:col-span-5">
          <LiveChatPreview />
        </div>
      </div>
    </div>
  );
}
