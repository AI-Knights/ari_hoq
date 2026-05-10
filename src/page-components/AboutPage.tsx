'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { StarField } from '../components/StarField';
import { IslamicPatterns } from '../components/IslamicPatterns';
import { Card } from '../components/ui/Card';
import { Heart, Shield, Zap, Users } from 'lucide-react';
import { SocialIcons } from '../components/SocialIcons';

export function AboutPage() {
  const features = [
    {
      icon: <Heart className="w-8 h-8 text-[#D4AF37]" />,
      title: 'Spiritual Connection',
      description:
        "More than just an app, we're a community dedicated to the preservation of the Holy Quran in our hearts."
    },
    {
      icon: <Shield className="w-8 h-8 text-[#D4AF37]" />,
      title: 'Safe Environment',
      description:
        'Gender-segregated matching and strict moderation ensure a respectful and focused learning space.'
    },
    {
      icon: <Zap className="w-8 h-8 text-[#D4AF37]" />,
      title: 'Smart Matching',
      description:
        'Our algorithm considers your level, goals, timezone, and language to find your ideal memorization partner.'
    },
    {
      icon: <Users className="w-8 h-8 text-[#D4AF37]" />,
      title: 'Global Community',
      description:
        'Connect with seekers from over 50 countries, united by a single noble purpose.'
    }
  ];

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text relative transition-colors duration-300">
      <StarField />
      <IslamicPatterns />
      <Navigation />

      <main className="relative z-10 pt-32 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-24 text-center">
          <motion.h1
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="text-5xl md:text-7xl font-serif font-bold mb-8"
          >
            Our <span className="text-[#D4AF37]">Vision</span>
          </motion.h1>
          <motion.p
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.1
            }}
            className="text-xl text-theme-text-secondary max-w-3xl mx-auto leading-relaxed"
          >
            To revive the tradition of communal Quran memorization in the digital
            age, connecting hearts across the globe through the words of Allah.
          </motion.p>
        </section>

        {/* Founder Story Section */}
        <section className="container mx-auto px-4 mb-32">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-theme-text mb-4">
                Meet the <span className="text-[#D4AF37]">Founder</span>
              </h2>
              <div className="w-24 h-1 bg-[#D4AF37] mx-auto rounded-full opacity-50"></div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border border-theme-border group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 transition-opacity duration-300"></div>
                  <img 
                    src="/images/founder.jpg" 
                    alt="Ari Hoq - Founder" 
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 p-8 z-20 w-full bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="text-2xl font-bold text-white font-serif">Ari Hoq</h3>
                    <p className="text-[#D4AF37] font-medium">Founder & Visionary</p>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-[#D4AF37] rounded-tl-2xl opacity-50"></div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-[#D4AF37] rounded-br-2xl opacity-50"></div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-theme-text">
                  A Journey of Connection
                </h3>
                <div className="space-y-4 text-theme-text-secondary leading-relaxed">
                  <p className="text-lg italic text-theme-text border-l-4 border-[#D4AF37] pl-4 py-2 bg-theme-bg-secondary/30 rounded-r-lg">
                    &quot;The journey of Hifz (memorization) is noble but challenging. True progress happens when we connect and support each other.&quot;
                  </p>
                  <p>
                    Many start their Quranic memorization with immense enthusiasm, but struggle to maintain consistency without a dedicated companion to recite to. In traditional settings, students would pair up in circles at the mosque, a blessed dynamic that brings discipline and spiritual bonding.
                  </p>
                  <p>
                    I asked a simple question: <strong className="text-theme-text font-medium">How can we bring this beautiful tradition to those who may be isolated, busy, or far from a community?</strong>
                  </p>
                  <p>
                    Quran Partners was born from this exact need. I envisioned a digital halaqah that transcends geographical borders, bringing the ancient tradition of mutual review to the modern world. My goal is to ensure no one has to walk the path of Hifz alone.
                  </p>
                </div>
                
                <div className="pt-6">
                  <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-theme-bg-secondary text-theme-text border border-theme-border hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition-all duration-300 font-medium group">
                    Get in Touch
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 mb-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 30
                }}
                whileInView={{
                  opacity: 1,
                  y: 0
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  delay: index * 0.1
                }}
              >
                <Card className="p-8 h-full hover:border-[#D4AF37]/50 transition-colors">
                  <div className="mb-6 p-4 bg-[#D4AF37]/10 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 font-serif text-theme-text">
                    {feature.title}
                  </h3>
                  <p className="text-theme-text-secondary">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Follow Us Section */}
        <section className="container mx-auto px-4 mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-theme-text mb-4">
              Follow Our <span className="text-[#D4AF37]">Journey</span>
            </h2>
            <p className="text-theme-text-secondary mb-8 max-w-xl mx-auto">
              Stay connected with our growing community on social media.
            </p>
            <div className="flex justify-center">
              <SocialIcons iconClassName="!w-11 !h-11" />
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}