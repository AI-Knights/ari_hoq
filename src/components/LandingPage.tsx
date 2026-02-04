'use client';

import React from 'react';
import { StarField } from './StarField';
import { IslamicPatterns } from './IslamicPatterns';
import { Navigation } from './Navigation';
import { HeroSection } from './HeroSection';
import { WhatWeDo } from './WhatWeDo';
import { HowItWorks } from './HowItWorks';
import { Testimonials } from './Testimonials';
import { CTASection } from './CTASection';
import { NewFooter } from './NewFooter';

export function LandingPage() {
  return (
    <div className="relative min-h-screen w-full dark:bg-[#0A1A3A] light:bg-gray-50 dark:text-white light:text-gray-900 selection:dark:bg-[#D4AF37] selection:light:bg-teal-200 selection:dark:text-[#0A1A3A] selection:light:text-gray-900">
      {/* Background Elements */}
      <StarField />
      <IslamicPatterns />

      {/* Content */}
      <div className="relative z-10">
        <Navigation />
        <HeroSection />
        <WhatWeDo />
        <HowItWorks />
        <Testimonials />
        <CTASection />
        <NewFooter />
      </div>
    </div>);

}