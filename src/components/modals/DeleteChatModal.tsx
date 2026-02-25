'use client';

import React, { useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (forBoth: boolean) => void;
    partnerName: string;
}

export function DeleteChatModal({ isOpen, onClose, onConfirm, partnerName }: DeleteChatModalProps) {
    const [forBoth, setForBoth] = useState(false);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative bg-[#0d1b3e] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl overflow-hidden"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        {/* Warning Icon */}
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                            <Trash2 className="w-8 h-8 text-red-500" />
                        </div>

                        <h3 className="text-xl font-serif font-bold text-white mb-2">Clear chat history?</h3>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            Are you sure you want to clear your chat history with <span className="text-[#D4AF37] font-semibold">{partnerName}</span>?
                        </p>

                        {/* Checkbox Card */}
                        <button
                            onClick={() => setForBoth(!forBoth)}
                            className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all mb-8 ${forBoth
                                    ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-white'
                                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${forBoth ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-gray-600'
                                }`}>
                                {forBoth && (
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2.5 6L4.5 8L9.5 3" stroke="#0d1b3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-sm font-medium">Also clear for {partnerName}</span>
                        </button>

                        {/* Actions */}
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-gray-300 font-medium hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm(forBoth);
                                    onClose();
                                }}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                            >
                                Clear History
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
