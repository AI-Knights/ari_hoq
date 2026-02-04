'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { CheckCircle2, Circle, TrendingUp, Award, Target } from 'lucide-react';

// All 114 Surahs with their names and number of verses
const SURAHS = [
    { number: 1, name: "Al-Fatihah", nameArabic: "الفاتحة", verses: 7, juz: 1 },
    { number: 2, name: "Al-Baqarah", nameArabic: "البقرة", verses: 286, juz: 1 },
    { number: 3, name: "Ali 'Imran", nameArabic: "آل عمران", verses: 200, juz: 3 },
    { number: 4, name: "An-Nisa", nameArabic: "النساء", verses: 176, juz: 4 },
    { number: 5, name: "Al-Ma'idah", nameArabic: "المائدة", verses: 120, juz: 6 },
    { number: 6, name: "Al-An'am", nameArabic: "الأنعام", verses: 165, juz: 7 },
    { number: 7, name: "Al-A'raf", nameArabic: "الأعراف", verses: 206, juz: 8 },
    { number: 8, name: "Al-Anfal", nameArabic: "الأنفال", verses: 75, juz: 9 },
    { number: 9, name: "At-Tawbah", nameArabic: "التوبة", verses: 129, juz: 10 },
    { number: 10, name: "Yunus", nameArabic: "يونس", verses: 109, juz: 11 },
    { number: 11, name: "Hud", nameArabic: "هود", verses: 123, juz: 11 },
    { number: 12, name: "Yusuf", nameArabic: "يوسف", verses: 111, juz: 12 },
    { number: 13, name: "Ar-Ra'd", nameArabic: "الرعد", verses: 43, juz: 13 },
    { number: 14, name: "Ibrahim", nameArabic: "ابراهيم", verses: 52, juz: 13 },
    { number: 15, name: "Al-Hijr", nameArabic: "الحجر", verses: 99, juz: 14 },
    { number: 16, name: "An-Nahl", nameArabic: "النحل", verses: 128, juz: 14 },
    { number: 17, name: "Al-Isra", nameArabic: "الإسراء", verses: 111, juz: 15 },
    { number: 18, name: "Al-Kahf", nameArabic: "الكهف", verses: 110, juz: 15 },
    { number: 19, name: "Maryam", nameArabic: "مريم", verses: 98, juz: 16 },
    { number: 20, name: "Taha", nameArabic: "طه", verses: 135, juz: 16 },
    { number: 21, name: "Al-Anbya", nameArabic: "الأنبياء", verses: 112, juz: 17 },
    { number: 22, name: "Al-Hajj", nameArabic: "الحج", verses: 78, juz: 17 },
    { number: 23, name: "Al-Mu'minun", nameArabic: "المؤمنون", verses: 118, juz: 18 },
    { number: 24, name: "An-Nur", nameArabic: "النور", verses: 64, juz: 18 },
    { number: 25, name: "Al-Furqan", nameArabic: "الفرقان", verses: 77, juz: 18 },
    { number: 26, name: "Ash-Shu'ara", nameArabic: "الشعراء", verses: 227, juz: 19 },
    { number: 27, name: "An-Naml", nameArabic: "النمل", verses: 93, juz: 19 },
    { number: 28, name: "Al-Qasas", nameArabic: "القصص", verses: 88, juz: 20 },
    { number: 29, name: "Al-'Ankabut", nameArabic: "العنكبوت", verses: 69, juz: 20 },
    { number: 30, name: "Ar-Rum", nameArabic: "الروم", verses: 60, juz: 21 },
    { number: 31, name: "Luqman", nameArabic: "لقمان", verses: 34, juz: 21 },
    { number: 32, name: "As-Sajdah", nameArabic: "السجدة", verses: 30, juz: 21 },
    { number: 33, name: "Al-Ahzab", nameArabic: "الأحزاب", verses: 73, juz: 21 },
    { number: 34, name: "Saba", nameArabic: "سبإ", verses: 54, juz: 22 },
    { number: 35, name: "Fatir", nameArabic: "فاطر", verses: 45, juz: 22 },
    { number: 36, name: "Ya-Sin", nameArabic: "يس", verses: 83, juz: 22 },
    { number: 37, name: "As-Saffat", nameArabic: "الصافات", verses: 182, juz: 23 },
    { number: 38, name: "Sad", nameArabic: "ص", verses: 88, juz: 23 },
    { number: 39, name: "Az-Zumar", nameArabic: "الزمر", verses: 75, juz: 23 },
    { number: 40, name: "Ghafir", nameArabic: "غافر", verses: 85, juz: 24 },
    { number: 41, name: "Fussilat", nameArabic: "فصلت", verses: 54, juz: 24 },
    { number: 42, name: "Ash-Shuraa", nameArabic: "الشورى", verses: 53, juz: 25 },
    { number: 43, name: "Az-Zukhruf", nameArabic: "الزخرف", verses: 89, juz: 25 },
    { number: 44, name: "Ad-Dukhan", nameArabic: "الدخان", verses: 59, juz: 25 },
    { number: 45, name: "Al-Jathiyah", nameArabic: "الجاثية", verses: 37, juz: 25 },
    { number: 46, name: "Al-Ahqaf", nameArabic: "الأحقاف", verses: 35, juz: 26 },
    { number: 47, name: "Muhammad", nameArabic: "محمد", verses: 38, juz: 26 },
    { number: 48, name: "Al-Fath", nameArabic: "الفتح", verses: 29, juz: 26 },
    { number: 49, name: "Al-Hujurat", nameArabic: "الحجرات", verses: 18, juz: 26 },
    { number: 50, name: "Qaf", nameArabic: "ق", verses: 45, juz: 26 },
    { number: 51, name: "Adh-Dhariyat", nameArabic: "الذاريات", verses: 60, juz: 26 },
    { number: 52, name: "At-Tur", nameArabic: "الطور", verses: 49, juz: 27 },
    { number: 53, name: "An-Najm", nameArabic: "النجم", verses: 62, juz: 27 },
    { number: 54, name: "Al-Qamar", nameArabic: "القمر", verses: 55, juz: 27 },
    { number: 55, name: "Ar-Rahman", nameArabic: "الرحمن", verses: 78, juz: 27 },
    { number: 56, name: "Al-Waqi'ah", nameArabic: "الواقعة", verses: 96, juz: 27 },
    { number: 57, name: "Al-Hadid", nameArabic: "الحديد", verses: 29, juz: 27 },
    { number: 58, name: "Al-Mujadila", nameArabic: "المجادلة", verses: 22, juz: 28 },
    { number: 59, name: "Al-Hashr", nameArabic: "الحشر", verses: 24, juz: 28 },
    { number: 60, name: "Al-Mumtahanah", nameArabic: "الممتحنة", verses: 13, juz: 28 },
    { number: 61, name: "As-Saf", nameArabic: "الصف", verses: 14, juz: 28 },
    { number: 62, name: "Al-Jumu'ah", nameArabic: "الجمعة", verses: 11, juz: 28 },
    { number: 63, name: "Al-Munafiqun", nameArabic: "المنافقون", verses: 11, juz: 28 },
    { number: 64, name: "At-Taghabun", nameArabic: "التغابن", verses: 18, juz: 28 },
    { number: 65, name: "At-Talaq", nameArabic: "الطلاق", verses: 12, juz: 28 },
    { number: 66, name: "At-Tahrim", nameArabic: "التحريم", verses: 12, juz: 28 },
    { number: 67, name: "Al-Mulk", nameArabic: "الملك", verses: 30, juz: 29 },
    { number: 68, name: "Al-Qalam", nameArabic: "القلم", verses: 52, juz: 29 },
    { number: 69, name: "Al-Haqqah", nameArabic: "الحاقة", verses: 52, juz: 29 },
    { number: 70, name: "Al-Ma'arij", nameArabic: "المعارج", verses: 44, juz: 29 },
    { number: 71, name: "Nuh", nameArabic: "نوح", verses: 28, juz: 29 },
    { number: 72, name: "Al-Jinn", nameArabic: "الجن", verses: 28, juz: 29 },
    { number: 73, name: "Al-Muzzammil", nameArabic: "المزمل", verses: 20, juz: 29 },
    { number: 74, name: "Al-Muddaththir", nameArabic: "المدثر", verses: 56, juz: 29 },
    { number: 75, name: "Al-Qiyamah", nameArabic: "القيامة", verses: 40, juz: 29 },
    { number: 76, name: "Al-Insan", nameArabic: "الانسان", verses: 31, juz: 29 },
    { number: 77, name: "Al-Mursalat", nameArabic: "المرسلات", verses: 50, juz: 29 },
    { number: 78, name: "An-Naba", nameArabic: "النبإ", verses: 40, juz: 30 },
    { number: 79, name: "An-Nazi'at", nameArabic: "النازعات", verses: 46, juz: 30 },
    { number: 80, name: "'Abasa", nameArabic: "عبس", verses: 42, juz: 30 },
    { number: 81, name: "At-Takwir", nameArabic: "التكوير", verses: 29, juz: 30 },
    { number: 82, name: "Al-Infitar", nameArabic: "الإنفطار", verses: 19, juz: 30 },
    { number: 83, name: "Al-Mutaffifin", nameArabic: "المطففين", verses: 36, juz: 30 },
    { number: 84, name: "Al-Inshiqaq", nameArabic: "الإنشقاق", verses: 25, juz: 30 },
    { number: 85, name: "Al-Buruj", nameArabic: "البروج", verses: 22, juz: 30 },
    { number: 86, name: "At-Tariq", nameArabic: "الطارق", verses: 17, juz: 30 },
    { number: 87, name: "Al-A'la", nameArabic: "الأعلى", verses: 19, juz: 30 },
    { number: 88, name: "Al-Ghashiyah", nameArabic: "الغاشية", verses: 26, juz: 30 },
    { number: 89, name: "Al-Fajr", nameArabic: "الفجر", verses: 30, juz: 30 },
    { number: 90, name: "Al-Balad", nameArabic: "البلد", verses: 20, juz: 30 },
    { number: 91, name: "Ash-Shams", nameArabic: "الشمس", verses: 15, juz: 30 },
    { number: 92, name: "Al-Layl", nameArabic: "الليل", verses: 21, juz: 30 },
    { number: 93, name: "Ad-Duhaa", nameArabic: "الضحى", verses: 11, juz: 30 },
    { number: 94, name: "Ash-Sharh", nameArabic: "الشرح", verses: 8, juz: 30 },
    { number: 95, name: "At-Tin", nameArabic: "التين", verses: 8, juz: 30 },
    { number: 96, name: "Al-'Alaq", nameArabic: "العلق", verses: 19, juz: 30 },
    { number: 97, name: "Al-Qadr", nameArabic: "القدر", verses: 5, juz: 30 },
    { number: 98, name: "Al-Bayyinah", nameArabic: "البينة", verses: 8, juz: 30 },
    { number: 99, name: "Az-Zalzalah", nameArabic: "الزلزلة", verses: 8, juz: 30 },
    { number: 100, name: "Al-'Adiyat", nameArabic: "العاديات", verses: 11, juz: 30 },
    { number: 101, name: "Al-Qari'ah", nameArabic: "القارعة", verses: 11, juz: 30 },
    { number: 102, name: "At-Takathur", nameArabic: "التكاثر", verses: 8, juz: 30 },
    { number: 103, name: "Al-'Asr", nameArabic: "العصر", verses: 3, juz: 30 },
    { number: 104, name: "Al-Humazah", nameArabic: "الهمزة", verses: 9, juz: 30 },
    { number: 105, name: "Al-Fil", nameArabic: "الفيل", verses: 5, juz: 30 },
    { number: 106, name: "Quraysh", nameArabic: "قريش", verses: 4, juz: 30 },
    { number: 107, name: "Al-Ma'un", nameArabic: "الماعون", verses: 7, juz: 30 },
    { number: 108, name: "Al-Kawthar", nameArabic: "الكوثر", verses: 3, juz: 30 },
    { number: 109, name: "Al-Kafirun", nameArabic: "الكافرون", verses: 6, juz: 30 },
    { number: 110, name: "An-Nasr", nameArabic: "النصر", verses: 3, juz: 30 },
    { number: 111, name: "Al-Masad", nameArabic: "المسد", verses: 5, juz: 30 },
    { number: 112, name: "Al-Ikhlas", nameArabic: "الإخلاص", verses: 4, juz: 30 },
    { number: 113, name: "Al-Falaq", nameArabic: "الفلق", verses: 5, juz: 30 },
    { number: 114, name: "An-Nas", nameArabic: "الناس", verses: 6, juz: 30 }
];

export function HifzJourneyPage() {
    const [completedSurahs, setCompletedSurahs] = useState<Set<number>>(new Set([1, 2, 3])); // Demo data

    const toggleSurah = (surahNumber: number) => {
        setCompletedSurahs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(surahNumber)) {
                newSet.delete(surahNumber);
            } else {
                newSet.add(surahNumber);
            }
            return newSet;
        });
    };

    const completionPercentage = Math.round((completedSurahs.size / 114) * 100);
    const totalVerses = SURAHS.reduce((acc, surah) => acc + surah.verses, 0);
    const completedVerses = SURAHS.filter(s => completedSurahs.has(s.number)).reduce((acc, surah) => acc + surah.verses, 0);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl md:text-4xl font-serif font-bold dark:text-white light:text-gray-900 mb-2">
                        Hifz Journey
                    </h1>
                    <p className="dark:text-gray-400 light:text-gray-600">
                        Track your complete Quran memorization progress
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="p-6 dark:bg-gradient-to-br dark:from-[#D4AF37]/20 dark:to-[#D4AF37]/5 light:bg-gradient-to-br light:from-teal-50 light:to-teal-100 border-2 dark:border-[#D4AF37]/30 light:border-teal-300">
                            <div className="flex items-center justify-between mb-2">
                                <TrendingUp className="w-8 h-8 dark:text-[#D4AF37] light:text-teal-600" />
                                <span className="text-2xl font-bold dark:text-[#D4AF37] light:text-teal-700">{completionPercentage}%</span>
                            </div>
                            <p className="text-sm dark:text-gray-300 light:text-gray-700 font-medium">Overall Progress</p>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <CheckCircle2 className="w-8 h-8 dark:text-green-400 light:text-green-600" />
                                <span className="text-2xl font-bold dark:text-white light:text-gray-900">{completedSurahs.size}/114</span>
                            </div>
                            <p className="text-sm dark:text-gray-400 light:text-gray-600">Surahs Completed</p>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <Target className="w-8 h-8 dark:text-blue-400 light:text-blue-600" />
                                <span className="text-2xl font-bold dark:text-white light:text-gray-900">{completedVerses}/{totalVerses}</span>
                            </div>
                            <p className="text-sm dark:text-gray-400 light:text-gray-600">Verses Memorized</p>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <Award className="w-8 h-8 dark:text-purple-400 light:text-purple-600" />
                                <span className="text-2xl font-bold dark:text-white light:text-gray-900">{114 - completedSurahs.size}</span>
                            </div>
                            <p className="text-sm dark:text-gray-400 light:text-gray-600">Remaining Surahs</p>
                        </Card>
                    </motion.div>
                </div>

                {/* Surahs Roadmap */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-serif font-bold dark:text-white light:text-gray-900">
                                Quran Roadmap
                            </h2>
                            <p className="text-sm dark:text-gray-400 light:text-gray-600">
                                Click on a Surah to mark as complete
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {SURAHS.map((surah, index) => {
                                const isCompleted = completedSurahs.has(surah.number);
                                return (
                                    <motion.button
                                        key={surah.number}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.01 }}
                                        onClick={() => toggleSurah(surah.number)}
                                        className={`
                      relative p-4 rounded-lg border-2 transition-all duration-300 text-left group
                      ${isCompleted
                                                ? 'dark:bg-gradient-to-br dark:from-[#D4AF37]/20 dark:to-[#D4AF37]/10 dark:border-[#D4AF37] light:bg-gradient-to-br light:from-teal-100 light:to-teal-50 light:border-teal-500'
                                                : 'dark:bg-[#11224a]/50 dark:border-white/10 light:bg-white light:border-gray-200 hover:dark:border-[#D4AF37]/50 hover:light:border-teal-300'
                                            }
                    `}
                                    >
                                        {/* Checkmark Icon */}
                                        <div className="absolute top-2 right-2">
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-5 h-5 dark:text-[#D4AF37] light:text-teal-600" />
                                            ) : (
                                                <Circle className="w-5 h-5 dark:text-gray-600 light:text-gray-300 group-hover:dark:text-[#D4AF37]/50 group-hover:light:text-teal-400" />
                                            )}
                                        </div>

                                        {/* Surah Number */}
                                        <div className={`text-3xl font-bold mb-2 ${isCompleted ? 'dark:text-[#D4AF37] light:text-teal-600' : 'dark:text-gray-500 light:text-gray-400'}`}>
                                            {surah.number}
                                        </div>

                                        {/* Surah Name */}
                                        <div className="space-y-1">
                                            <p className={`text-sm font-semibold ${isCompleted ? 'dark:text-white light:text-gray-900' : 'dark:text-gray-300 light:text-gray-700'}`}>
                                                {surah.name}
                                            </p>
                                            <p className={`text-xs font-arabic ${isCompleted ? 'dark:text-[#D4AF37]/80 light:text-teal-600' : 'dark:text-gray-500 light:text-gray-500'}`} dir="rtl">
                                                {surah.nameArabic}
                                            </p>
                                            <p className={`text-xs ${isCompleted ? 'dark:text-gray-400 light:text-gray-600' : 'dark:text-gray-600 light:text-gray-500'}`}>
                                                {surah.verses} verses
                                            </p>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </Card>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
