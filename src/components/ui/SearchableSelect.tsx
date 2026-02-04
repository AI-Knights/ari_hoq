'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchableSelectProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label: string;
}

export function SearchableSelect({ options, value, onChange, placeholder, label }: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative">
            <label className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-2">
                {label}
            </label>

            {/* Selected Value Display / Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 dark:bg-[#11224a] light:bg-white border dark:border-white/10 light:border-gray-300 rounded-lg dark:text-white light:text-gray-900 text-left flex items-center justify-between hover:dark:border-[#D4AF37]/50 hover:light:border-teal-500 transition-colors"
            >
                <span className={value ? 'dark:text-white light:text-gray-900' : 'dark:text-gray-500 light:text-gray-400'}>
                    {value || placeholder}
                </span>
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Content */}
                    <div className="absolute z-20 w-full mt-2 dark:bg-[#11224a] light:bg-white border dark:border-white/10 light:border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                        {/* Search Input */}
                        <div className="p-3 border-b dark:border-white/10 light:border-gray-200 sticky top-0 dark:bg-[#11224a] light:bg-white">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-gray-500 light:text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2 dark:bg-[#0A1A3A] light:bg-gray-50 border dark:border-white/10 light:border-gray-200 rounded-lg dark:text-white light:text-gray-900 placeholder:dark:text-gray-500 placeholder:light:text-gray-400 focus:outline-none focus:dark:border-[#D4AF37] focus:light:border-teal-500"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="overflow-y-auto max-h-60">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`w-full px-4 py-2.5 text-left hover:dark:bg-[#D4AF37]/10 hover:light:bg-teal-50 transition-colors ${value === option
                                                ? 'dark:bg-[#D4AF37]/20 dark:text-[#D4AF37] light:bg-teal-100 light:text-teal-700'
                                                : 'dark:text-gray-300 light:text-gray-700'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center dark:text-gray-500 light:text-gray-400">
                                    No results found
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
