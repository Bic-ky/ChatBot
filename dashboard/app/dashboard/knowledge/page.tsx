'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  UploadCloud,
  FileText,
  Globe,
  Plus,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Clock,
  HelpCircle
} from 'lucide-react';

interface DocumentItem {
  id: string;
  name: string;
  type: 'pdf' | 'markdown' | 'url' | 'faq';
  chunks: number;
  status: 'Ready' | 'Indexing' | 'Failed';
  date: string;
}

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<'files' | 'url' | 'faq'>('files');
  const [urlInput, setUrlInput] = useState('');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: '1',
      name: 'Company_Service_Pricing_2026.pdf',
      type: 'pdf',
      chunks: 24,
      status: 'Ready',
      date: 'Sep 4, 2026',
    },
    {
      id: '2',
      name: 'Platform_Architecture_Guide.md',
      type: 'markdown',
      chunks: 42,
      status: 'Ready',
      date: 'Sep 3, 2026',
    },
    {
      id: '3',
      name: 'https://example.com/terms',
      type: 'url',
      chunks: 12,
      status: 'Ready',
      date: 'Sep 1, 2026',
    },
  ]);

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const newDoc: DocumentItem = {
      id: Date.now().toString(),
      name: urlInput.trim(),
      type: 'url',
      chunks: 8,
      status: 'Ready',
      date: 'Just now',
    };
    setDocuments([newDoc, ...documents]);
    setUrlInput('');
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;

    const newDoc: DocumentItem = {
      id: Date.now().toString(),
      name: `FAQ: ${faqQuestion.trim()}`,
      type: 'faq',
      chunks: 1,
      status: 'Ready',
      date: 'Just now',
    };
    setDocuments([newDoc, ...documents]);
    setFaqQuestion('');
    setFaqAnswer('');
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Knowledge Base</h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload private documents and sync web pages. Files are chunked and converted into 1536-dim vector embeddings.
        </p>
      </div>

      {/* Upload Modes Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex border-b border-slate-100 gap-6">
          <button
            onClick={() => setActiveTab('files')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'files'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span>Document Upload (PDF / TXT / MD)</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'url'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Sync Web URL</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'faq'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Manual FAQ Q&A</span>
          </button>
        </div>

        {/* Tab 1: File Upload */}
        {activeTab === 'files' && (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-400 transition-colors bg-slate-50/50 cursor-pointer">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <UploadCloud className="h-6 w-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Drag and drop your knowledge files here</h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
              Supports PDF, Markdown, and TXT files up to 25MB each. Text is securely indexed into your tenant-isolated vector store.
            </p>
            <button className="mt-4 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
              Browse Files
            </button>
          </div>
        )}

        {/* Tab 2: URL Crawler */}
        {activeTab === 'url' && (
          <form onSubmit={handleAddUrl} className="space-y-4">
            <label className="block text-xs font-semibold text-slate-700">
              Target Web URL to Ingest
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://docs.yourcompany.com/overview"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Crawl & Index</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Manual FAQ */}
        {activeTab === 'faq' && (
          <form onSubmit={handleAddFaq} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Question
              </label>
              <input
                type="text"
                required
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
                placeholder="e.g., Do you offer refunds within 30 days?"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verified Business Answer
              </label>
              <textarea
                rows={3}
                required
                value={faqAnswer}
                onChange={(e) => setFaqAnswer(e.target.value)}
                placeholder="e.g., Yes, we offer a full 100% money-back guarantee within the first 30 days of subscription."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Save FAQ</span>
            </button>
          </form>
        )}
      </div>

      {/* Indexed Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Indexed Sources ({documents.length})</h3>
          <span className="text-xs text-slate-400 font-medium">pgvector Vector Store: Active</span>
        </div>

        <div className="divide-y divide-slate-100">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                  {doc.type === 'url' ? (
                    <Globe className="h-4 w-4" />
                  ) : doc.type === 'faq' ? (
                    <HelpCircle className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">{doc.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-0.5">
                    <span>{doc.chunks} vector chunks</span>
                    <span>•</span>
                    <span>Added {doc.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{doc.status}</span>
                </span>
                <button
                  onClick={() => handleDelete(doc.id)}
                  title="Remove document"
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
