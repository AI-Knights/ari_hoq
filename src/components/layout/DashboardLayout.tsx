'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { IslamicPatterns } from '../IslamicPatterns';
interface DashboardLayoutProps {
  children: React.ReactNode;
}
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="h-screen flex flex-col text-theme-text transition-colors duration-300 overflow-hidden" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <IslamicPatterns />
      </div>

      <Sidebar />

      <main className="lg:ml-64 flex-1 relative z-10 pt-16 lg:pt-0 min-h-0 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col min-h-0">
          {children}
        </div>
      </main>
    </div>);

}