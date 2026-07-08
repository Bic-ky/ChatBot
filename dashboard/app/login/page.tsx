'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Lock, Mail, Building } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiClient, AuthTokens } from '@/lib/api';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let tokens: AuthTokens;
      if (isRegister) {
        tokens = await apiClient<AuthTokens>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            tenant_name: tenantName,
            email,
            password,
          }),
        });
      } else {
        tokens = await apiClient<AuthTokens>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email,
            password,
          }),
        });
      }
      await login(tokens);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Column - Product Showcase */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-900 p-12 text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">ChatBot AI</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-medium backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Strict Multi-Tenant Row-Level Isolation</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Deploy private AI support directly into your website in minutes.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Ingest your documents, FAQs, and web pages into a pgvector knowledge base. Provide verified, hallucination-free support to your customers 24/7.
          </p>

          <div className="space-y-3 pt-4">
            {[
              'LangGraph-powered source attribution & citations',
              'FastAPI async architecture with sub-second latency',
              'Zero data crossover guaranteed between business accounts',
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          &copy; 2026 ChatBot SaaS Platform. All rights reserved.
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {isRegister ? 'Register your business' : 'Welcome back'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRegister
                ? 'Create your multi-tenant account and start indexing your private knowledge.'
                : 'Sign in to manage your assistants, documents, and chat logs.'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Business / Company Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="Acme Global Inc."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-100 disabled:opacity-60"
            >
              <span>{loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : 'Need a business account? Register here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
