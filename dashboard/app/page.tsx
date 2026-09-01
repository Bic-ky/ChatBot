'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Bot,
  BookOpen,
  Code2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Check,
  ChevronRight,
  Send,
  MessageSquare,
  Globe,
  BarChart3,
  Layers,
  HelpCircle,
  Paperclip,
  Star
} from 'lucide-react';

export default function LandingPage() {
  const [demoInput, setDemoInput] = useState('');
  const [demoMessages, setDemoMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello! I am your AI customer-support assistant trained on your private knowledge base. How can I help you today?',
      sources: ['Company_Handbook.pdf'],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sampleQueries = [
    'What are your pricing plans?',
    'How do you guarantee tenant data isolation?',
    'How do I embed the chat widget on WordPress?',
  ];

  const handleDemoSubmit = (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg = { role: 'user', content: text, sources: [] };
    setDemoMessages((prev) => [...prev, userMsg]);
    setDemoInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botReply = `Based on your indexed documentation, we provide multi-tenant isolation using PostgreSQL row-level security and pgvector embeddings. All customer chats cite verified sources with zero hallucinations.`;
      let sources = ['Security_Whitepaper.pdf (Page 3)', 'Architecture_Spec.md'];

      if (text.toLowerCase().includes('pricing') || text.toLowerCase().includes('plan')) {
        botReply = `Our plans start at $49/month for small businesses with 2 assistants and 50,000 queries. Enterprise tiers offer custom LLM fine-tuning, 99.99% uptime SLAs, and dedicated cluster deployments.`;
        sources = ['Pricing_Catalog_2026.pdf'];
      } else if (text.toLowerCase().includes('embed') || text.toLowerCase().includes('wordpress')) {
        botReply = `You can embed the widget on any website (WordPress, Shopify, Next.js, or HTML) by adding a single <script> tag before the </body> tag. It loads asynchronously without blocking page speed.`;
        sources = ['Widget_Integration_Guide.md'];
      }

      setDemoMessages((prev) => [
        ...prev,
        { role: 'assistant', content: botReply, sources },
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">ChatBot AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#demo" className="hover:text-white transition-colors">
              Live Demo
            </a>
            <a href="#architecture" className="hover:text-white transition-colors">
              Architecture
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-400 transition-colors"
            >
              API Docs
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        {/* Glow gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-indigo-400 text-xs font-medium backdrop-blur-sm shadow-inner">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Multi-Tenant Enterprise RAG Architecture</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">FastAPI & pgvector</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
            Turn Your Business Knowledge into{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200">
              Autonomous 24/7 AI Support
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Upload company PDFs, manuals, and web URLs. Deploy an intelligent, hallucination-free AI assistant onto any website with a single line of JavaScript.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Deploy Your First Assistant</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Bot className="h-4 w-4 text-indigo-400" />
              <span>Try Live Interactive Demo</span>
            </a>
          </div>

          {/* Highlights bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-slate-800/80 text-left">
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">88.4%</p>
              <p className="text-xs text-slate-400 mt-0.5">Autonomous Resolution</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">&lt;850ms</p>
              <p className="text-xs text-slate-400 mt-0.5">Streaming Latency</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">100%</p>
              <p className="text-xs text-slate-400 mt-0.5">Tenant Data Isolation</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">1 Line</p>
              <p className="text-xs text-slate-400 mt-0.5">Script Integration</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Interactive Demo Section */}
      <section id="demo" className="py-20 px-6 bg-slate-950/60 border-y border-slate-800/80 relative">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Test the AI Assistant Live
            </h2>
            <p className="text-xs text-slate-400">
              Experience zero-hallucination semantic search. Answers cite the exact source document and chunk metadata.
            </p>
          </div>

          {/* Demo Shell */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden max-w-3xl mx-auto">
            {/* Window header */}
            <div className="h-12 bg-slate-800/60 px-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="text-xs text-slate-400 font-mono ml-2">ChatBot Sandbox v0.3</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                pgvector Connected
              </span>
            </div>

            {/* Chat conversation area */}
            <div className="p-6 space-y-4 min-h-[320px] max-h-[420px] overflow-y-auto">
              {demoMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 flex items-center justify-center flex-shrink-0 text-xs">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div className="max-w-[85%] space-y-1.5">
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {msg.sources.map((src, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-indigo-500/20 text-[10px] font-medium"
                          >
                            <Paperclip className="h-2.5 w-2.5 text-indigo-400" />
                            {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 items-center text-xs text-slate-400 pl-11">
                  <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-slate-500 font-mono">Retrieving knowledge chunks...</span>
                </div>
              )}
            </div>

            {/* Quick Suggestions */}
            <div className="px-6 py-2 bg-slate-900/60 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-slate-500 flex-shrink-0 font-medium">Try:</span>
              {sampleQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDemoSubmit(q)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 flex-shrink-0 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDemoSubmit(demoInput);
              }}
              className="p-3 bg-slate-800/40 border-t border-slate-800 flex gap-2"
            >
              <input
                type="text"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                placeholder="Ask about pricing, data isolation, or widget integration..."
                className="flex-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!demoInput.trim() || isTyping}
                className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <span>Send</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Engineered for Enterprise Security & Reliability
            </h2>
            <p className="text-sm text-slate-400">
              Built from the ground up as a modular monolith with strict tenant isolation, pgvector semantic search, and streaming widget integration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'Multi-Format Knowledge Ingestion',
                desc: 'Upload PDF manuals, Markdown docs, or scrape public company URLs. Background Celery workers chunk and index content idempotently.',
              },
              {
                icon: ShieldCheck,
                title: 'PostgreSQL Tenant Isolation',
                desc: 'Guaranteed cross-tenant data separation. Every SQL query, vector search, and token consumption is scoped to your unique tenant ID.',
              },
              {
                icon: Layers,
                title: 'pgvector Semantic Retrieval',
                desc: 'Fast 1536-dimensional vector search with hybrid cosine similarity. Retrieves the most relevant snippets to ground the LLM.',
              },
              {
                icon: Zap,
                title: 'LangGraph Orchestration',
                desc: 'Strict source hierarchy: private knowledge base first, optional Tavily web search fallback, and automatic human escalation.',
              },
              {
                icon: Code2,
                title: 'One-Line Web Component Widget',
                desc: 'Vanilla TypeScript + Web Component widget. Embeds seamlessly on any site with domain whitelisting and rate-limited tokens.',
              },
              {
                icon: BarChart3,
                title: 'Real-Time Audits & Analytics',
                desc: 'Inspect full user conversations, exact token consumption, cited document pages, and cost estimates in an executive dashboard.',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-3 group"
                >
                  <div className="h-10 w-10 rounded-xl bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-20 px-6 bg-slate-950/40 border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              System Blueprint
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Predictable, Secure Data Flow
            </h2>
            <p className="text-xs text-slate-400">
              Never trust client-supplied tenant IDs. The security chain is enforced at every layer:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
            {[
              { step: '01', title: 'Tenant Auth', desc: 'JWT + Argon2id' },
              { step: '02', title: 'Isolated RLS', desc: 'PostgreSQL DB' },
              { step: '03', title: 'Semantic Search', desc: 'pgvector cosine' },
              { step: '04', title: 'LangGraph RAG', desc: 'LLM Guardrails' },
              { step: '05', title: 'Streamed Tokens', desc: 'SSE Widget' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1.5 relative"
              >
                <span className="text-[10px] font-mono text-indigo-400 font-bold">{item.step}</span>
                <h4 className="text-xs font-bold text-white">{item.title}</h4>
                <p className="text-[10px] text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Simple Pricing
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Scales with Your Support Volume
            </h2>
            <p className="text-xs text-slate-400">
              Start free, upgrade as your customer interactions and documentation grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter',
                price: '$49',
                period: '/month',
                desc: 'Perfect for small businesses deploying their first AI support assistant.',
                features: [
                  '1 AI Assistant',
                  'Up to 100 Document Pages',
                  '10,000 queries / month',
                  'pgvector Semantic Search',
                  'Standard Widget Embedding',
                  'Email Support',
                ],
                cta: 'Start Free Trial',
                highlight: false,
              },
              {
                name: 'Growth',
                price: '$149',
                period: '/month',
                desc: 'For growing companies requiring multiple bots, web scraping, and web search fallback.',
                features: [
                  'Up to 5 AI Assistants',
                  'Unlimited Document Ingestion',
                  'Website URL Auto-Crawler',
                  'Tavily Web Search Fallback',
                  'Domain Whitelisting (CORS)',
                  'Priority Slack Support',
                ],
                cta: 'Get Started with Growth',
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                desc: 'Tailored SLA, dedicated PostgreSQL + pgvector clusters, and fine-tuned models.',
                features: [
                  'Unlimited Assistants & Tenants',
                  'Dedicated Vector Database Cluster',
                  'Custom LLM Fine-Tuning',
                  '99.99% Uptime SLA',
                  'SSO / SAML Authentication',
                  'Dedicated Support Engineer',
                ],
                cta: 'Contact Sales',
                highlight: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border flex flex-col justify-between space-y-6 ${
                  plan.highlight
                    ? 'bg-slate-800/80 border-indigo-500 shadow-xl shadow-indigo-600/15 relative'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{plan.desc}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/login"
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
                    plan.highlight
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-10 sm:p-14 text-center space-y-6 border border-indigo-700/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to deploy your AI business assistant?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Create an account in 30 seconds. Index your documentation and paste the embed script on your website today.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-950 font-bold text-xs hover:bg-slate-100 shadow-lg shadow-black/20 transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-6 bg-slate-950 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-slate-300">ChatBot AI Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-slate-300">
              API Documentation
            </a>
            <a href="http://localhost:8000/health" target="_blank" rel="noreferrer" className="hover:text-slate-300">
              System Status
            </a>
            <Link href="/login" className="hover:text-slate-300">
              Dashboard Login
            </Link>
          </div>
          <p>&copy; 2026 ChatBot SaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
