import React, { memo } from 'react';
import Link from 'next/link';

export function Footer() {
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
                  onClick={() => {
                    const element = document.getElementById('how-it-works');
                    if (element)
                      element.scrollIntoView({
                        behavior: 'smooth'
                      });
                  }}
                  className="hover:text-[#D4AF37] transition-colors">

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
                <Link
                  href="/about"
                  className="hover:text-[#D4AF37] transition-colors">

                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[#D4AF37] transition-colors">

                  Contact
                </Link>
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
              <li>
                <Link href="/guidelines" className="hover:text-[#D4AF37] transition-colors">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Quran Partners. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {/* Social icons placeholders */}
            <div className="w-5 h-5 bg-gray-600 hover:bg-[#D4AF37] transition-colors rounded-full cursor-pointer"></div>
            <div className="w-5 h-5 bg-gray-600 hover:bg-[#D4AF37] transition-colors rounded-full cursor-pointer"></div>
            <div className="w-5 h-5 bg-gray-600 hover:bg-[#D4AF37] transition-colors rounded-full cursor-pointer"></div>
          </div>
        </div>
      </div>
    </footer>);

}