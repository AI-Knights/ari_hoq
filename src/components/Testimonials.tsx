'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';
import { Avatar } from './ui/Avatar';
const testimonials = [
  {
    quote:
      'Finding a partner who matches my pace has been a blessing. We motivate each other every morning after Fajr.',
    name: 'Yusuf Al-Fayed',
    location: 'Cairo, Egypt',
    role: 'Memorized 15 Juz'
  },
  {
    quote:
      "The app made it so easy to connect with someone in my timezone. It's transformed my hifz journey completely.",
    name: 'Sarah Williams',
    location: 'London, UK',
    role: 'Beginner'
  },
  {
    quote:
      'I was struggling with consistency for years. Having a dedicated partner keeps me accountable and focused.',
    name: 'Abdullah Rahman',
    location: 'Kuala Lumpur, Malaysia',
    role: 'Completed Hifz'
  }];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <section className="py-24 relative z-10 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-theme-text mb-4">
            Voices from Our Community
          </h2>
        </div>

        <div className="max-w-4xl mx-auto relative min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{
                opacity: 0,
                x: 50
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              exit={{
                opacity: 0,
                x: -50
              }}
              transition={{
                duration: 0.5
              }}
              className="text-center">

              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <Quote className="w-8 h-8 text-[#D4AF37]" />
                </div>
              </div>

              <blockquote className="text-2xl md:text-3xl font-serif text-theme-text mb-8 leading-relaxed italic">
                "{testimonials[currentIndex].quote}"
              </blockquote>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-theme-subtle mb-3 overflow-hidden border-2 border-[#D4AF37]">
                  <Avatar
                    fallback={testimonials[currentIndex].name.charAt(0)}
                    size="md"
                  />
                </div>
                <cite className="not-italic">
                  <span className="block text-lg font-bold text-theme-text">
                    {testimonials[currentIndex].name}
                  </span>
                  <span className="block text-sm text-[#D4AF37]">
                    {testimonials[currentIndex].location}
                  </span>
                  <span className="block text-xs text-theme-muted mt-1">
                    {testimonials[currentIndex].role}
                  </span>
                </cite>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center space-x-2 mt-12">
            {testimonials.map((_, idx) =>
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-[#D4AF37]' : 'bg-theme-text-secondary opacity-40 hover:opacity-60'}`}
                aria-label={`Go to testimonial ${idx + 1}`} />

            )}
          </div>
        </div>
      </div>
    </section>);

}