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
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                {label}
            </label>

            {/* Selected Value Display / Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-theme-card border border-theme-subtle rounded-lg text-theme-text text-left flex items-center justify-between hover:border-[#D4AF37]/50 transition-colors"
            >
                <span className={value ? 'text-theme-text' : 'text-theme-muted'}>
                    {value || placeholder}
                </span>
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 bg-theme-card border border-theme-subtle rounded-lg shadow-2xl max-h-80 shadow-black/50 overflow-hidden flex flex-col">
                    {/* Search Input */}
                    <div className="p-3 border-b border-theme-border flex-shrink-0 bg-theme-card">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg text-theme-input focus:outline-none focus:border-[#D4AF37]"
                                style={{
                                    backgroundColor: 'var(--theme-input-bg)',
                                    borderColor: 'var(--theme-input-border)',
                                    color: 'var(--theme-input-text)',
                                    border: '1px solid var(--theme-input-border)'
                                }}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="overflow-y-auto overflow-x-hidden flex-1 max-h-56">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={`w-full px-4 py-2.5 text-left hover:bg-[#D4AF37]/10 transition-colors ${value === option
                                        ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                                        : 'text-theme-text-secondary'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-theme-muted">
                                No results found
                            </div>
                        )}
                    </div>
                    {/* Invisible Backdrop overlay solely for clicking outside */}
                    <div
                        className="fixed inset-0 z-[-1]"
                        onClick={() => setIsOpen(false)}
                    />
                </div>
            )}
        </div>
    );
}
