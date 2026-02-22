'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, BookOpen, Globe as GlobeIcon, Calendar, TrendingUp } from 'lucide-react';
import { Card } from './ui/Card';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    index: number;
}

function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
        >
            <Card className="p-6 text-center bg-theme-card border-theme-border hover:border-[#D4AF37]/30 transition-all duration-300 group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
                    <div className="text-[#D4AF37]">{icon}</div>
                </div>
                <h3 className="text-lg font-bold text-theme-text mb-2 font-serif">{title}</h3>
                <p className="text-sm text-theme-text-secondary leading-relaxed">{description}</p>
            </Card>
        </motion.div>
    );
}

export function WhatWeDo() {
    const features = [
        {
            icon: <Users className="w-8 h-8" />,
            title: 'Pairing Partners',
            description: 'Get matched based on Hifz levels, goals, frameworks, habits, timezone and availability to find the perfect Quran study partner.'
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: 'Safe Environment',
            description: 'Our platform ensures a secure and welcoming Islamic space. A judgment-free space where you can focus on your journey without worry.'
        },
        {
            icon: <BookOpen className="w-8 h-8" />,
            title: 'Qur\'an Learning',
            description: 'From complete beginners to seasoned reciters or while PEO, find a tailored partner to study, recite, and memorize together in fun ways.'
        },
        {
            icon: <GlobeIcon className="w-8 h-8" />,
            title: 'Global Community',
            description: 'Connect with Muslims from around the world while you are asleep doing rewarding time and build lasting bonds through faith.'
        },
        {
            icon: <Calendar className="w-8 h-8" />,
            title: 'Flexible Scheduling',
            description: 'Choose sessions that fit your lifestyle. Whether it\'s morning, afternoon or evening, our platform provides your availability to find the perfect match.'
        },
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: 'Progress Tracking',
            description: 'Monitor your Hifz journey with detailed progress reports. Celebrate milestones and stay motivated with real-time updates.'
        }
    ];

    return (
        <section className="py-24 relative z-10">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block mb-4"
                    >
                        <span className="text-sm text-[#D4AF37] font-medium tracking-wider uppercase">
                            ★ What We do? ★
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-serif font-bold text-theme-text mb-4"
                    >
                        Faith fueled connections to help you start or continue on a journey towards memorizing the Holy Quran
                    </motion.h2>
                </div>

                {/* Feature Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
