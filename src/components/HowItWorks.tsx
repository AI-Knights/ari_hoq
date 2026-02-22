'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Users, Calendar, BookOpen, TrendingUp } from 'lucide-react';

const steps = [
  {
    number: '1',
    icon: <UserPlus className="w-6 h-6" />,
    title: 'Create Your Profile',
    titleArabic: 'أنشئ ملفك',
    description: 'Set up your Quran progress journey within minutes. Choose your hifz level and preferences including schedule, frameworks, and personalized study approach.'
  },
  {
    number: '2',
    icon: <Users className="w-6 h-6" />,
    title: 'Get Matched',
    titleArabic: 'احصل على شريك',
    description: 'Our system pairs you with ideal matches compatible members to ensure you always check. You can also choose from work and add requests if you find the perfect match.'
  },
  {
    number: '3',
    icon: <Calendar className="w-6 h-6" />,
    title: 'Schedule Sessions',
    titleArabic: 'حدد الجلسات',
    description: 'Once matched, pick time to prepare a plan or schedule a time to meet up. Pick what fits you, plan for both of you to sync or define.'
  },
  {
    number: '4',
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Study Together',
    titleArabic: 'ادرسوا معاً',
    description: 'Begin or continue your Hifz Journey! Schedule weekly review sessions or practice together. Stay engaged together as a motivating team.'
  },
  {
    number: '5',
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Track Your Progress',
    titleArabic: 'تتبع تقدمك',
    description: "Log your sessions and keep track of what you've memorized, reviewed, or learned. Set goals and celebrate milestones with your partner."
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative z-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="text-sm text-[#D4AF37] font-medium tracking-wider uppercase">
              كيف تعمل
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif font-bold text-theme-text mb-4"
          >
            ★ How It Works ★
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-theme-text-secondary max-w-2xl mx-auto"
          >
            Start your personalized Quran memorization journey with a dedicated partner today
          </motion.p>
        </div>

        {/* Timeline Steps */}
        <div className="max-w-4xl mx-auto relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#D4AF37]/20 via-[#D4AF37]/50 to-[#D4AF37]/20 transform -translate-x-1/2" />

          <div className="space-y-16">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    x: isEven ? -50 : 50
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0
                  }}
                  viewport={{
                    once: true
                  }}
                  transition={{
                    delay: index * 0.2
                  }}
                  className={`relative flex items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

                  {/* Content */}
                  <div
                    className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'}`}>

                    <div className="bg-theme-card border border-theme-border rounded-2xl p-6 hover:border-[#D4AF37]/30 transition-all duration-300">
                      <div
                        className={`flex items-center gap-3 mb-3 ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>

                        <span className="text-xs text-theme-text-secondary">
                          {step.titleArabic}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-theme-text mb-3 font-serif">
                        {step.title}
                      </h3>
                      <p className="text-theme-text-secondary text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Center Icon Badge */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0A1A3A] shadow-[0_0_20px_rgba(212,175,55,0.4)] relative z-10">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold border-2" style={{ borderColor: 'var(--theme-bg)' }}>
                      {step.number}
                    </div>
                  </div>

                  {/* Spacer for alignment */}
                  <div className="flex-1 hidden md:block" />
                </motion.div>);

            })}
          </div>
        </div>
      </div>
    </section>);

}