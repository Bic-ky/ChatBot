'use client';

import React, { useState } from 'react';
import {
  Bot,
  Sliders,
  Globe,
  Users,
  Code,
  Check,
  Copy,
  Sparkles,
  Save,
  Plus
} from 'lucide-react';

export default function AssistantsPage() {
  const [name, setName] = useState('Support & Sales Assistant');
  const [model, setModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.2);
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a professional business assistant for our company. Answer inquiries strictly using the verified company knowledge base. If information cannot be verified, politely offer to connect the customer with human support.'
  );
  const [welcomeMessage, setWelcomeMessage] = useState(
    'Hello! Welcome to our website. How can I help you today?'
  );
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [humanHandoffEnabled, setHumanHandoffEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const embedCode = `<script 
  src="https://cdn.chatbot-saas.com/widget.js" 
  data-assistant-id="asst_prod_9921" 
  defer>
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Assistants</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure system prompts, LLM parameters, and copy the embed widget for your website.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-colors">
          <Plus className="h-4 w-4" />
          <span>New Assistant</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Settings */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Assistant Personality & Parameters
            </h2>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assistant Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            {/* Model & Temperature */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  LLM Foundation Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                >
                  <option value="gpt-4o-mini">OpenAI gpt-4o-mini (Fast & Recommended)</option>
                  <option value="gpt-4o">OpenAI gpt-4o (Complex Reasoning)</option>
                  <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Temperature</label>
                  <span className="text-xs font-mono font-bold text-indigo-600">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Lower = factual and deterministic; Higher = creative.
                </span>
              </div>
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                System Instructions & Guardrails
              </label>
              <textarea
                rows={4}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed"
              />
            </div>

            {/* Welcome Message */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Welcome Message
              </label>
              <input
                type="text"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Web Search Fallback</h4>
                    <p className="text-[11px] text-slate-400">
                      Allow bot to query Tavily search when private docs don't answer the prompt.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={webSearchEnabled}
                  onChange={(e) => setWebSearchEnabled(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Human Handoff Request</h4>
                    <p className="text-[11px] text-slate-400">
                      Offer a "Connect to human agent" option when confidence is low.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={humanHandoffEnabled}
                  onChange={(e) => setHumanHandoffEnabled(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              {saved && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  <span>Changes saved!</span>
                </span>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </form>

        {/* Right Column: Embed Script Snippet */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
                <Code className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Website Embed Snippet</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Paste this single script tag before the closing{' '}
              <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">
                &lt;/body&gt;
              </code>{' '}
              tag of your website to render the assistant.
            </p>

            <div className="relative bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto">
              <pre>{embedCode}</pre>
              <button
                onClick={handleCopy}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div className="text-[11px] text-slate-400">
              Whitelisted domains for this assistant can be configured under{' '}
              <a href="/dashboard/settings" className="text-indigo-600 font-semibold hover:underline">
                Settings &gt; Allowed Domains
              </a>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
