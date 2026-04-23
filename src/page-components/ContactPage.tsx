'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { StarField } from '../components/StarField';
import { IslamicPatterns } from '../components/IslamicPatterns';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Mail, MessageSquare, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';

async function sendContactMessage(payload: {
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const res = await fetch('/api/v/contact/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send message.');
  return data;
}

export function ContactPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !message.trim()) {
      setError('Email and message are required.');
      return;
    }

    setIsSending(true);
    try {
      const data = await sendContactMessage({
        first_name: firstName,
        last_name: lastName,
        email,
        subject,
        message,
      });
      setSuccess(data.message || 'Your message has been sent!');
      setFirstName('');
      setLastName('');
      setEmail('');
      setSubject('General Inquiry');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text relative transition-colors duration-300">
      <StarField />
      <IslamicPatterns />
      <Navigation />

      <main className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-theme-text mb-4">
              Get In <span className="text-[#D4AF37]">Touch</span>
            </h1>
            <p className="text-theme-text-secondary max-w-2xl mx-auto text-lg">
              Have a question, suggestion, or need support? We&apos;re here to help.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8">
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#D4AF37]/10 rounded-xl flex-shrink-0">
                      <Mail className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-theme-text mb-1">Email</h3>
                      <p className="text-theme-text-secondary text-sm">support@quranpartners.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#D4AF37]/10 rounded-xl flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-theme-text mb-1">Response Time</h3>
                      <p className="text-theme-text-secondary text-sm">Within 24–48 hours, in sha Allah</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#D4AF37]/10 rounded-xl flex-shrink-0">
                      <MapPin className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-theme-text mb-1">Global Community</h3>
                      <p className="text-theme-text-secondary text-sm">Serving Muslims around the world</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2"
            >
              <Card className="p-8 md:p-10 bg-theme-card backdrop-blur-md">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="First Name"
                      placeholder="Ahmed"
                      value={firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                    />
                    <Input
                      label="Last Name"
                      placeholder="Ali"
                      value={lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                    />
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="ahmed@example.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-theme-text-secondary">Subject</label>
                    <select
                      className="w-full bg-theme-input border border-theme-input-border rounded-lg px-4 py-2.5 text-theme-text focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    >
                      <option>General Inquiry</option>
                      <option>Technical Support</option>
                      <option>Report an Issue</option>
                      <option>Partnership</option>
                    </select>
                  </div>

                  <Textarea
                    label="Message"
                    placeholder="How can we help you?"
                    rows={6}
                    value={message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                    required
                  />

                  {success && (
                    <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      {success}
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto"
                    rightIcon={<Send className="w-4 h-4" />}
                    isLoading={isSending}
                    disabled={isSending}
                  >
                    {isSending ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}