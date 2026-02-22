'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Youtube } from 'lucide-react';

export function NewFooter() {
    return (
        <>
            {/* Donation Section */}
            <section className="py-16 relative z-10 bg-theme-subtle">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-theme-text mb-6">
                        Help us reach every ummah
                    </h2>

                    <button className="px-12 py-4 rounded-full border-2 border-[#D4AF37] text-[#D4AF37] font-bold text-lg hover:bg-[#D4AF37] hover:text-[#0A1A3A] transition-all mb-8">
                        Donate
                    </button>

                    <div className="max-w-2xl mx-auto">
                        <p className="text-theme-text-secondary mb-2">
                            Every dollar brings someone closer to the Qur'an.
                        </p>
                        <p className="text-theme-muted italic text-sm">
                            "The best of you are those who learn the Qur'an and teach it."
                            <br />
                            <span className="font-medium">— Prophet Muhammad ﷺ (Bukhari)</span>
                        </p>
                    </div>

                    {/* Decorative candles */}
                    <div className="flex justify-center gap-8 mt-8 opacity-60">
                        <div className="w-2 h-16 bg-amber-100 rounded-t-full relative">
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-orange-400 rounded-full blur-sm"></div>
                        </div>
                        <div className="w-3 h-20 bg-amber-100 rounded-t-full relative">
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-orange-400 rounded-full blur-sm"></div>
                        </div>
                        <div className="w-2 h-16 bg-amber-100 rounded-t-full relative">
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-orange-400 rounded-full blur-sm"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer
                className="relative z-10 border-t border-theme-border backdrop-blur-md pt-16 pb-8 transition-colors duration-300"
                style={{ backgroundColor: 'var(--theme-bg)' }}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-x-12 md:gap-y-8 mb-12">
                        {/* Brand & Description */}
                        <div className="flex flex-col items-center sm:items-start col-span-1 md:col-span-1">
                            <Link href="/" className="block mb-6 group w-full max-w-[200px] sm:max-w-[220px] md:max-w-[240px] lg:max-w-[280px]">
                                <Image
                                    src="/logo.png"
                                    alt="QuranPartners Logo"
                                    width={280}
                                    height={280}
                                    className="w-full h-auto object-contain"
                                    priority
                                />
                            </Link>
                            <p className="text-theme-text-secondary text-sm leading-relaxed mb-4 text-center sm:text-left">
                                Connecting hearts through the Quran. A global platform for
                                memorization partners.
                            </p>
                            <div className="flex space-x-6 mt-4 md:mt-0">
                                <div className="w-5 h-5 bg-theme-subtle border border-theme-border hover:bg-[#D4AF37] transition-colors rounded-full cursor-pointer"></div>
                                <div className="w-5 h-5 bg-theme-subtle border border-theme-border hover:bg-[#D4AF37] transition-colors rounded-full cursor-pointer"></div>
                                <div className="w-5 h-5 bg-theme-subtle border border-theme-border hover:bg-[#D4AF37] transition-colors rounded-full cursor-pointer"></div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="text-center sm:text-left">
                            <h4 className="text-theme-text font-bold mb-6">Platform</h4>
                            <ul className="space-y-4 text-sm text-theme-text-secondary">
                                <li>
                                    <button onClick={() => {
                                        const element = document.getElementById('how-it-works');
                                        if (element) element.scrollIntoView({ behavior: 'smooth' });
                                    }} className="hover:text-[#D4AF37] transition-colors">
                                        How it Works
                                    </button>
                                </li>
                                <li><Link href="/auth" className="hover:text-[#D4AF37] transition-colors">Find a Partner</Link></li>
                                <li><Link href="/about" className="hover:text-[#D4AF37] transition-colors">Success Stories</Link></li>
                                <li><Link href="/auth" className="hover:text-[#D4AF37] transition-colors">Get Started</Link></li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div className="text-center sm:text-left">
                            <h4 className="text-theme-text font-bold mb-6">Resources</h4>
                            <ul className="space-y-4 text-sm text-theme-text-secondary">
                                <li><Link href="/about" className="hover:text-[#D4AF37] transition-colors">About Us</Link></li>
                                <li><Link href="/contact" className="hover:text-[#D4AF37] transition-colors">Contact</Link></li>
                                <li><Link href="/about" className="hover:text-[#D4AF37] transition-colors">Help Center</Link></li>
                                <li><Link href="/about" className="hover:text-[#D4AF37] transition-colors">Blog</Link></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div className="text-center sm:text-left">
                            <h4 className="text-theme-text font-bold mb-6">Legal</h4>
                            <ul className="space-y-4 text-sm text-theme-text-secondary">
                                <li><Link href="/about" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/about" className="hover:text-[#D4AF37] transition-colors">Terms of Service</Link></li>
                                <li><Link href="/about" className="hover:text-[#D4AF37] transition-colors">Cookie Policy</Link></li>
                                <li><Link href="/contact" className="hover:text-[#D4AF37] transition-colors">Community Guidelines</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-theme-border pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-theme-muted text-sm">
                            © {new Date().getFullYear()} Quran Partners. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}
