'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { StarField } from '../components/StarField';
import { IslamicPatterns } from '../components/IslamicPatterns';
import { Globe } from '../components/Globe';
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

        {/* Story Section */}
        <section className="container mx-auto px-4 mb-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{
                opacity: 0,
                x: -50
              }}
              whileInView={{
                opacity: 1,
                x: 0
              }}
              viewport={{
                once: true
              }}
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-theme-text">
                Why We Started
              </h2>
              <div className="space-y-6 text-theme-text-secondary leading-relaxed">
                <p>
                  The journey of Hifz (memorization) is noble but challenging.
                  Many start with enthusiasm but struggle to maintain consistency
                  without a companion to recite to.
                </p>
                <p>
                  In traditional settings, students would pair up in circles at
                  the mosque. We asked: how can we bring this blessed dynamic to
                  those who may be isolated, busy, or far from a community?
                </p>
                <p>
                  Quran Partners was born from this need—a digital halaqah that
                  transcends borders, bringing the ancient tradition of mutual
                  review to the modern world.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8
              }}
              whileInView={{
                opacity: 1,
                scale: 1
              }}
              viewport={{
                once: true
              }}
              className="relative h-[400px] flex items-center justify-center"
            >
              <Globe />
            </motion.div>
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