'use client';

import React, { useState } from 'react';
import { Flag, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { reason: string; reportType: string; severity: string; blockUser: boolean }) => void;
    partnerName: string;
}

const REPORT_TYPES = [
    { value: 'message', label: 'Inappropriate Messages', icon: '💬' },
    { value: 'profile', label: 'Inappropriate Profile', icon: '👤' },
    { value: 'behavior', label: 'Harassment or Abuse', icon: '⚠️' },
    { value: 'other', label: 'Other', icon: '📋' },
];

const SEVERITY_LEVELS = [
    { value: 'low', label: 'Minor Issue', color: 'yellow' },
    { value: 'medium', label: 'Moderate Concern', color: 'orange' },
    { value: 'high', label: 'Serious Violation', color: 'red' },
];

export function ReportModal({ isOpen, onClose, onSubmit, partnerName }: ReportModalProps) {
    const [reportType, setReportType] = useState('behavior');
    const [severity, setSeverity] = useState('medium');
    const [reason, setReason] = useState('');
    const [blockUser, setBlockUser] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!reason.trim()) return;
        
        setIsSubmitting(true);
        try {
            await onSubmit({ reason: reason.trim(), reportType, severity, blockUser });
            // Reset form
            setReportType('behavior');
            setSeverity('medium');
            setReason('');
            setBlockUser(true);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    className="relative bg-[#0d1b3e] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                                <Flag className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-serif font-bold text-white">Report User</h3>
                                <p className="text-sm text-gray-400">Reporting <span className="text-[#D4AF37]">{partnerName}</span></p>
                            </div>
                        </div>

                        {/* Report Type Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                What's the issue?
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {REPORT_TYPES.map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => setReportType(type.value)}
                                        className={`p-3 rounded-xl border text-left transition-all ${
                                            reportType === type.value
                                                ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-white'
                                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="text-2xl mb-1">{type.icon}</div>
                                        <div className="text-sm font-medium">{type.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Severity Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                How serious is this?
                            </label>
                            <div className="space-y-2">
                                {SEVERITY_LEVELS.map((level) => (
                                    <button
                                        key={level.value}
                                        onClick={() => setSeverity(level.value)}
                                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                                            severity === level.value
                                                ? `bg-${level.color}-500/10 border-${level.color}-500/30 text-white`
                                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                            severity === level.value ? 'border-[#D4AF37]' : 'border-gray-600'
                                        }`}>
                                            {severity === level.value && (
                                                <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                                            )}
                                        </div>
                                        <span className="text-sm font-medium">{level.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Reason Text Area */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Please explain what happened <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Describe the issue in detail..."
                                rows={4}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/30 focus:ring-2 focus:ring-[#D4AF37]/20 resize-none"
                                maxLength={500}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">Be specific and factual</p>
                                <p className="text-xs text-gray-500">{reason.length}/500</p>
                            </div>
                        </div>

                        {/* Block User Option */}
                        <button
                            onClick={() => setBlockUser(!blockUser)}
                            className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all mb-6 ${
                                blockUser
                                    ? 'bg-red-500/10 border-red-500/30 text-white'
                                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                blockUser ? 'bg-red-500 border-red-500' : 'border-gray-600'
                            }`}>
                                {blockUser && (
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M2.5 6L4.5 8L9.5 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-sm font-medium">Block this user</div>
                                <div className="text-xs text-gray-400 mt-0.5">They won't be able to contact you</div>
                            </div>
                        </button>

                        {/* Warning Note */}
                        <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-200 leading-relaxed">
                                False reports are taken seriously. Our moderation team will review your report and take appropriate action.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-gray-300 font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!reason.trim() || isSubmitting}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
