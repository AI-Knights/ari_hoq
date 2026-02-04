'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Users, Calendar, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: <UserPlus className="w-10 h-10" />,
    title: 'Create Your Profile',
    titleArabic: 'أنشئ ملفك',
    description: 'Set up your Quran progress journey within minutes. Choose your hifz level and preferences including schedule, frameworks, and personalized study approach.'
  },
  {
    icon: <Users className="w-10 h-10" />,
    title: 'Get Matched',
    titleArabic: 'احصل على المطابقة',
    description: 'Our system pairs you with ideal matches compatible members to ensure you always check. You can also choose from work and add requests if you find the perfect match.'
  },
  {
    icon: <Calendar className="w-10 h-10" />,
    title: 'Schedule Sessions',
    titleArabic: 'جدولة الجلسات',
    description: 'Once matched, pick time to prepare a plan/ask or schedule a time to meet up via Zoom. Pick what fits you, plan for both of you to sync or define.'
  },
  {
    icon: <TrendingUp className="w-10 h-10" />,
    title: 'Study Together',
    titleArabic: 'ندرس معا',
    description: 'Begin or continue your Hifz Journey! Schedule weekly review sessions or practice together. You can always update your manual dashboard or by itself and  you can stay engaged together as a together motivating team.'
  },
  {
    icon: <TrendingUp className="w-10 h-10" />,
    title: 'Track Your Progress',
    titleArabic: 'تتبع تقدمك',
    description: 'Stay sharp! Keep a log of your daily practice and weekly reviews using our built-in tracking system with your friend. Manual or automated, the goals you stay consistent with your partner.'
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative z-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm dark:text-[#D4AF37] light:text-teal-600 font-medium mb-2 tracking-wider">
              كيف يعمل
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold dark:text-white light:text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="dark:text-gray-400 light:text-gray-600 max-w-2xl mx-auto">
              Start your personalized Quran mastering the Qur'an memorizing life
              <br />
              with a dedicated partner today
            </p>
          </motion.div>
        </div>

        {/* Steps - Vertical Layout with connecting line */}
        <div className="max-w-4xl mx-auto relative">
          {/* Connecting vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 dark:bg-teal-500/30 light:bg-teal-400/30 -translate-x-1/2"></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex items-center gap-8 mb-16 last:mb-0 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } flex-col md:flex-row`}
            >
              {/* Icon with number badge */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-full dark:bg-teal-600 light:bg-teal-500 flex items-center justify-center dark:text-white light:text-white shadow-lg relative z-10">
                  {step.icon}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full dark:bg-[#D4AF37] light:bg-yellow-500 dark:text-[#0A1A3A] light:text-white flex items-center justify-center font-bold text-sm border-4 dark:border-[#0A1A3A] light:border-white">
                  {index + 1}
                </div>
              </div>

              {/* Content Card */}
              <div className={`flex-1 ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'} text-center md:text-left`}>
                <div className="dark:bg-[#11224a]/80 light:bg-white p-6 rounded-xl border dark:border-white/10 light:border-gray-200 shadow-lg">
                  <p className="text-xs dark:text-[#D4AF37] light:text-teal-600 mb-1">{step.titleArabic}</p>
                  <h3 className="text-xl font-bold dark:text-white light:text-gray-900 mb-3 font-serif">
                    {step.title}
                  </h3>
                  <p className="text-sm dark:text-gray-400 light:text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}