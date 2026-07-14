'use client';

import React from 'react';
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';
import { useAuth } from '@/lib/auth-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <div className="h-4 w-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <span>Verifying tenant session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
