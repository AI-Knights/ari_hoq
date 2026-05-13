'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SocialIcons } from './SocialIcons';

export function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  // "How it Works" — scroll if on home, navigate otherwise
  const handleHowItWorks = () => {
    if (pathname === '/') {
      const element = document.getElementById('how-it-works');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#how-it-works');
    }
  };

  // Same-page link — scroll to top; otherwise navigate normally
  const handlePageLink = (path: string) => {
    if (pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push(path);
    }
  };

  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#0A1A3A]/80 backdrop-blur-md pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link
              href="/"
              className="text-2xl font-bold font-serif text-white tracking-wide block mb-6">
              Quran<span className="text-[#D4AF37]">Partners</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting hearts through the Quran. A global platform for
              memorization partners.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <button
                  onClick={handleHowItWorks}
                  className="hover:text-[#D4AF37] transition-colors text-left">
                  How it Works
                </button>
              </li>
              <li>
                <Link
                  href="/auth"
                  className="hover:text-[#D4AF37] transition-colors">
                  Find a Partner
                </Link>
              </li>
              <li>
                <Link
                  href="/auth"
                  className="hover:text-[#D4AF37] transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => handlePageLink('/about')}
                  className="hover:text-[#D4AF37] transition-colors text-left">
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePageLink('/contact')}
                  className="hover:text-[#D4AF37] transition-colors text-left">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <Link href="/privacy" className="hover:text-[#D4AF37] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#D4AF37] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} QuranMemorizationPartner. All rights reserved.
          </p>
          <SocialIcons iconClassName="!bg-gray-700 !border-gray-600 !text-gray-300 hover:!bg-[#D4AF37] hover:!text-[#0A1A3A]" />
        </div>
      </div>
    </footer>
  );
}