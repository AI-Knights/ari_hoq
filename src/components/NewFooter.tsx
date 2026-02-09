'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Youtube } from 'lucide-react';

export function NewFooter() {
    return (
        <>
            {/* Donation Section */}
            <section className="py-16 relative z-10 dark:bg-[#0A1A3A]/50 light:bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold dark:text-white light:text-gray-900 mb-6">
                        Help us reach every ummah
                    </h2>

                    <button className="px-12 py-4 rounded-full border-2 dark:border-[#D4AF37] light:border-teal-600 dark:text-[#D4AF37] light:text-teal-600 font-bold text-lg hover:dark:bg-[#D4AF37] hover:light:bg-teal-600 hover:dark:text-[#0A1A3A] hover:light:text-white transition-all mb-8">
                        Donate
                    </button>

                    <div className="max-w-2xl mx-auto">
                        <p className="dark:text-gray-300 light:text-gray-700 mb-2">
                            Every dollar brings someone closer to the Qur'an.
                        </p>
                        <p className="dark:text-gray-400 light:text-gray-600 italic text-sm">
                            "The best of you are those who learn the Qur'an and teach it."
                            <br />
                            <span className="font-medium">— Prophet Muhammad ﷺ (Bukhari)</span>
                        </p>
                    </div>

                    {/* Decorative candles */}
                    <div className="flex justify-center gap-8 mt-8 opacity-60">
                        <div className="w-2 h-16 dark:bg-amber-100 light:bg-amber-200 rounded-t-full relative">
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 dark:bg-orange-400 light:bg-orange-500 rounded-full blur-sm"></div>
                        </div>
                        <div className="w-3 h-20 dark:bg-amber-100 light:bg-amber-200 rounded-t-full relative">
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 dark:bg-orange-400 light:bg-orange-500 rounded-full blur-sm"></div>
                        </div>
                        <div className="w-2 h-16 dark:bg-amber-100 light:bg-amber-200 rounded-t-full relative">
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 dark:bg-orange-400 light:bg-orange-500 rounded-full blur-sm"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t dark:border-white/5 light:border-gray-200 dark:bg-[#0A1A3A]/80 light:bg-white backdrop-blur-md py-8 md:py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-x-12 md:gap-y-8 mb-8">
                        {/* Brand & Description */}
                        <div className="flex flex-col items-center sm:items-start">
                            <Link href="/" className="block mb-6 md:mb-10 group w-full max-w-[200px] sm:max-w-[220px] md:max-w-[240px] lg:max-w-[280px]">
                                <Image
                                    src="/logo.png"
                                    alt="QuranPartners Logo"
                                    width={280}
                                    height={280}
                                    className="w-full h-auto object-contain"
                                    priority
                                />
                            </Link>
                            <p className="text-sm dark:text-gray-400 light:text-gray-600 mb-4 text-center sm:text-left leading-relaxed">
                                Connecting Muslims who pursue
                                <br />
                                an unbreakable Quran learning
                                <br />
                                habit together.
                            </p>
                            <div className="flex gap-3 justify-center sm:justify-start">
                                <a
                                    href="#"
                                    className="w-8 h-8 rounded flex items-center justify-center dark:bg-teal-600 light:bg-teal-500 dark:text-white light:text-white hover:opacity-80 transition-opacity"
                                    aria-label="Instagram"
                                >
                                    <Instagram className="w-4 h-4" />
                                </a>
                                <a
                                    href="#"
                                    className="w-8 h-8 rounded flex items-center justify-center dark:bg-teal-600 light:bg-teal-500 dark:text-white light:text-white hover:opacity-80 transition-opacity"
                                    aria-label="YouTube"
                                >
                                    <Youtube className="w-4 h-4" />
                                </a>
                                <a
                                    href="#"
                                    className="w-8 h-8 rounded flex items-center justify-center dark:bg-[#D4AF37] light:bg-yellow-500 dark:text-white light:text-white hover:opacity-80 transition-opacity"
                                    aria-label="Facebook"
                                >
                                    <Facebook className="w-4 h-4" />
                                </a>
                                <a
                                    href="#"
                                    className="w-8 h-8 rounded flex items-center justify-center dark:bg-[#D4AF37] light:bg-yellow-500 dark:text-white light:text-white hover:opacity-80 transition-opacity"
                                    aria-label="Twitter"
                                >
                                    <Twitter className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="text-center sm:text-left">
                            <h4 className="dark:text-white light:text-gray-900 font-bold mb-4 text-base">Navigation</h4>
                            <ul className="space-y-2 text-sm dark:text-gray-400 light:text-gray-600">
                                <li><Link href="/" className="hover:dark:text-[#D4AF37] hover:light:text-teal-600 transition-colors inline-block">Home</Link></li>
                                <li><Link href="/about" className="hover:dark:text-[#D4AF37] hover:light:text-teal-600 transition-colors inline-block">About</Link></li>
                                <li><Link href="/about" className="hover:dark:text-[#D4AF37] hover:light:text-teal-600 transition-colors inline-block">What We do</Link></li>
                                <li><Link href="/contact" className="hover:dark:text-[#D4AF37] hover:light:text-teal-600 transition-colors inline-block">Contact</Link></li>
                            </ul>
                        </div>

                        {/* Features */}
                        <div className="text-center sm:text-left">
                            <h4 className="dark:text-white light:text-gray-900 font-bold mb-4 text-base">Features</h4>
                            <ul className="space-y-2 text-sm dark:text-gray-400 light:text-gray-600">
                                <li><Link href="/find-partner" className="hover:dark:text-[#D4AF37] hover:light:text-teal-600 transition-colors inline-block">Partner Matching</Link></li>
                                <li><Link href="/friends" className="hover:dark:text-[#D4AF37] hover:light:text-teal-600 transition-colors inline-block">My Friends</Link></li>
                                <li><Link href="/chat" className="hover:dark:text-[#D4AF37] hover:light:text-teal-600 transition-colors inline-block">Safe Environment</Link></li>
                                <li><Link href="/dashboard" className="hover:dark:text-[#D4AF37] hover:light:text-teal-600 transition-colors inline-block">Virtual Community</Link></li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div className="text-center sm:text-left">
                            <h4 className="dark:text-white light:text-gray-900 font-bold mb-4 text-base">Support</h4>
                            <ul className="space-y-2 text-sm dark:text-gray-400 light:text-gray-600">
                                <li><Link href="/contact" className="hover:dark:text-[#D4AF37] hover:light:text-teal-600 transition-colors inline-block">Help Center</Link></li>
                                <li><Link href="/about" className="hover:dark:text-[#D4AF37] hover:light:text-teal-600 transition-colors inline-block">Privacy Policy</Link></li>
                                <li><Link href="/about" className="hover:dark:text-[#D4AF37] hover:light:text-teal-600 transition-colors inline-block">Terms of Services</Link></li>
                                <li><Link href="/contact" className="hover:dark:text-[#D4AF37] hover:light:text-teal-600 transition-colors inline-block">Community Guidelines</Link></li>
                                <li><Link href="/about" className="hover:dark:text-[#D4AF37] hover:light:text-teal-600 transition-colors inline-block">Report an Issue</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t dark:border-white/5 light:border-gray-200 pt-6 text-center">
                        <p className="text-sm dark:text-gray-500 light:text-gray-600">
                            © {new Date().getFullYear()} Quran Partners. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}
