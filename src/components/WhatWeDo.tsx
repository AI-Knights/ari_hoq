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
            <Card className="p-6 text-center hover:border-[#D4AF37]/50 transition-all group dark:bg-[#11224a]/80 light:bg-white">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#D4AF37]/10 dark:bg-[#D4AF37]/10 light:bg-teal-50 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
                    <div className="dark:text-[#D4AF37] light:text-teal-600">{icon}</div>
                </div>
                <h3 className="text-lg font-bold dark:text-white light:text-gray-900 mb-2 font-serif">{title}</h3>
                <p className="text-sm dark:text-gray-400 light:text-gray-600 leading-relaxed">{description}</p>
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
                {/* Header with decorative cloud */}
                <div className="text-center mb-16 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative inline-block"
                    >
                        {/* Decorative cloud shape */}
                        <div className="absolute inset-0 -z-10">
                            <svg viewBox="0 0 400 150" className="w-full h-auto dark:opacity-20 light:opacity-10">
                                <path
                                    d="M50 80 Q50 50, 80 50 Q80 30, 110 30 Q140 30, 140 50 Q170 50, 170 80 Q170 50, 200 50 Q230 50, 230 80 Q260 80, 260 100 Q230 100, 230 80 Q200 80, 200 100 Q170 100, 170 80 Q140 80, 140 100 Q110 100, 110 80 Q80 80, 80 100 Q50 100, 50 80"
                                    fill="currentColor"
                                    className="dark:text-teal-500 light:text-teal-400"
                                />
                            </svg>
                        </div>

                        <p className="text-sm dark:text-[#D4AF37] light:text-teal-600 font-medium mb-2 tracking-wider">مالك</p>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold dark:text-white light:text-gray-900 mb-4">
                            What We do?
                        </h2>
                        <p className="text-sm dark:text-gray-400 light:text-gray-600 max-w-2xl mx-auto">
                            Faith fueled <span className="dark:text-[#D4AF37] light:text-teal-600 font-semibold">CONNECTIONS</span> to help you start or continue
                            <br />
                            on a journey towards memorizing the <span className="dark:text-[#D4AF37] light:text-teal-600 font-semibold">HOLY QURAN</span>
                        </p>
                    </motion.div>
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
