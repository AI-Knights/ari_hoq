'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { IslamicPatterns } from '../IslamicPatterns';
interface DashboardLayoutProps {
  children: React.ReactNode;
}
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0A1A3A] text-white">
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <IslamicPatterns />
      </div>

      <Sidebar />

      <main className="lg:ml-64 min-h-screen relative z-10 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {children}
        </div>
      </main>
    </div>);

}