'use client';

import React, { useState } from 'react';
import { Settings, Shield, Globe, Key, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const { user } = useAuth();
  const [domains, setDomains] = useState(['example.com', 'www.example.com']);
  const [newDomain, setNewDomain] = useState('');
  const [saved, setSaved] = useState(false);

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setDomains([...domains, newDomain.trim().toLowerCase()]);
    setNewDomain('');
  };

  const handleRemoveDomain = (d: string) => {
    setDomains(domains.filter((item) => item !== d));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Organization & Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage tenant security configurations, whitelisted domains for widget embedding, and API keys.
        </p>
      </div>

      {/* Tenant Profile */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-600" />
          <span>Tenant Organization</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Organization Name
            </label>
            <p className="text-xs font-semibold text-slate-900">{user?.tenant?.name || 'My Business'}</p>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Tenant ID (UUID)
            </label>
            <p className="text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
              {user?.tenant_id || 'active-tenant-uuid'}
            </p>
          </div>
        </div>
      </div>

      {/* Allowed Domains */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-600" />
            <span>Allowed Website Domains (CORS Security)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Only websites running on these origins will be permitted to initialize and stream from your chat assistant.
          </p>
        </div>

        <form onSubmit={handleAddDomain} className="flex gap-2">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="e.g. app.yourdomain.com"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Origin</span>
          </button>
        </form>

        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
          {domains.map((d) => (
            <div key={d} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
              <span className="text-xs font-mono text-slate-700">{d}</span>
              <button
                onClick={() => handleRemoveDomain(d)}
                className="p-1 text-slate-400 hover:text-red-600 rounded"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Key className="h-4 w-4 text-indigo-600" />
          <span>Server API Keys</span>
        </h3>
        <p className="text-xs text-slate-500">
          Use server keys to access knowledge ingestion and conversation endpoints from your backend.
        </p>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <p className="text-xs font-semibold text-slate-900">Default Production Key</p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">cb_live_8942****************</p>
          </div>
          <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm">
            Roll Key
          </button>
        </div>
      </div>
    </div>
  );
}
