'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { StarField } from '../components/StarField';
import { IslamicPatterns } from '../components/IslamicPatterns';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Mail, MessageSquare, MapPin, Send } from 'lucide-react';
export function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0A1A3A] text-white relative">
      <StarField />
      <IslamicPatterns />
      <Navigation />

      <main className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="text-center mb-16">

            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
              Get in <span className="text-[#D4AF37]">Touch</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have questions or feedback? We'd love to hear from you. Our team
              is here to support your journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Info */}
            <motion.div
              initial={{
                opacity: 0,
                x: -30
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              transition={{
                delay: 0.2
              }}
              className="md:col-span-1 space-y-6">

              <Card className="p-8 h-full bg-[#11224a]/80 backdrop-blur-md">
                <h3 className="text-2xl font-serif font-bold mb-8">
                  Contact Info
                </h3>

                <div className="space-y-8">
                  <div className="flex items-start">
                    <Mail className="w-6 h-6 text-[#D4AF37] mt-1 mr-4" />
                    <div>
                      <p className="font-medium text-white">Email Us</p>
                      <p className="text-gray-400">salam@quranpartners.com</p>
                      <p className="text-gray-400">support@quranpartners.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MessageSquare className="w-6 h-6 text-[#D4AF37] mt-1 mr-4" />
                    <div>
                      <p className="font-medium text-white">Live Chat</p>
                      <p className="text-gray-400">Available Mon-Fri</p>
                      <p className="text-gray-400">9am - 5pm EST</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="w-6 h-6 text-[#D4AF37] mt-1 mr-4" />
                    <div>
                      <p className="font-medium text-white">Location</p>
                      <p className="text-gray-400">Global Remote Team</p>
                      <p className="text-gray-400">Based in London, UK</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{
                opacity: 0,
                x: 30
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              transition={{
                delay: 0.3
              }}
              className="md:col-span-2">

              <Card className="p-8 md:p-10 bg-[#11224a]/80 backdrop-blur-md">
                <form
                  className="space-y-6"
                  onSubmit={(e) => e.preventDefault()}>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input label="First Name" placeholder="Ahmed" />
                    <Input label="Last Name" placeholder="Ali" />
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="ahmed@example.com" />


                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-300">
                      Subject
                    </label>
                    <select className="w-full bg-[#0A1A3A]/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none">
                      <option>General Inquiry</option>
                      <option>Technical Support</option>
                      <option>Report an Issue</option>
                      <option>Partnership</option>
                    </select>
                  </div>

                  <Textarea
                    label="Message"
                    placeholder="How can we help you?"
                    rows={6} />


                  <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto"
                    rightIcon={<Send className="w-4 h-4" />}>

                    Send Message
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>);

}