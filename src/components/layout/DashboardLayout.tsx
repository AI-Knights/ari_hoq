'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { IslamicPatterns } from '../IslamicPatterns';
interface DashboardLayoutProps {
  children: React.ReactNode;
  isFullHeight?: boolean;
}
export function DashboardLayout({ children, isFullHeight = false }: DashboardLayoutProps) {
  return (
    <div className="h-screen flex flex-col text-theme-text transition-colors duration-300 overflow-hidden" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <IslamicPatterns />
      </div>

      <Sidebar />

      <main className={`lg:ml-64 flex-1 relative z-10 pt-16 lg:pt-0 min-h-0 ${isFullHeight ? 'h-full overflow-hidden' : 'overflow-y-auto'}`}>
        <div className={`${isFullHeight ? 'h-full flex flex-col min-h-0 w-full lg:max-w-7xl lg:mx-auto lg:px-8 lg:py-12' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12'}`}>
          {children}
        </div>
      </main>
    </div>);

}