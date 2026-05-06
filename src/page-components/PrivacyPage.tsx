'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '../components/Navigation';
import { NewFooter } from '../components/NewFooter';
import { StarField } from '../components/StarField';
import { IslamicPatterns } from '../components/IslamicPatterns';
import { Shield, Mail } from 'lucide-react';

const sections = [
  {
    title: '1. Introduction',
    content: `Welcome to Quranmemorizationpartner ("Platform," "we," "our," or "us"). This Privacy Policy explains how we collect, use, store, and protect information when users access or use the Platform.

By using the Platform, you agree to the practices described in this Privacy Policy.`,
  },
  {
    title: '2. Information We Collect',
    content: null,
    subsections: [
      {
        subtitle: 'Account Information',
        items: [
          'Name or username',
          'Email address (if provided)',
          'Authentication method (email, Google, guest/anonymous login)',
        ],
      },
      {
        subtitle: 'Profile Information',
        items: [
          'Learning level',
          'Preferred language',
          'Availability or scheduling preferences',
          'Gender (optional)',
          'Timezone',
          'Country or region information (optional)',
        ],
      },
      {
        subtitle: 'Communication & Platform Usage',
        items: [
          'Chat metadata',
          'User activity related to matching and platform functionality',
          'Reports, moderation requests, or safety-related submissions',
        ],
      },
      {
        subtitle: 'Technical Information',
        items: [
          'IP address',
          'Browser type',
          'Device information',
          'Authentication tokens or session cookies',
          'Basic analytics and diagnostic information',
        ],
      },
    ],
  },
  {
    title: '3. How We Use Information',
    content: 'We use collected information to:',
    list: [
      'Create and manage user accounts',
      'Match users with compatible Quran study partners',
      'Enable real-time chat and communication features',
      'Support meeting integrations',
      'Maintain platform safety, moderation, and security',
      'Improve system functionality and user experience',
      'Detect spam, abuse, unauthorized access, or fraudulent activity',
      'Respond to user inquiries and support requests',
    ],
  },
  {
    title: '4. Cookies & Authentication Technologies',
    content: 'The Platform may use cookies, authentication tokens, or similar technologies to:',
    list: [
      'Maintain secure login sessions',
      'Improve platform performance',
      'Support essential website functionality',
      'Enhance user experience',
    ],
    postContent:
      'Users may manage browser cookie settings independently; however, some Platform features may not function properly if cookies are disabled.',
  },
  {
    title: '5. Data Sharing & Third-Party Services',
    content:
      "We do not sell or rent users' personal information. Limited information may be shared with trusted third-party providers only when necessary to operate the Platform, including:",
    list: [
      'Zoom API or meeting providers',
      'Hosting and infrastructure providers',
      'Authentication providers',
      'Email and notification services',
      'Payment processors such as Stripe (if payments are enabled in the future)',
    ],
    postContent: 'These third-party services maintain their own privacy policies and practices.',
  },
  {
    title: '6. Data Security',
    content:
      'We implement reasonable technical and administrative safeguards intended to protect user information from unauthorized access, misuse, or disclosure.\n\nHowever, no online platform, electronic storage system, or internet transmission method can be guaranteed to be 100% secure. Users acknowledge and accept these risks when using the Platform.',
  },
  {
    title: '7. Chat & Communication Privacy',
    content: 'Chats are intended to remain private between matched users.',
    postContent:
      'Platform administrators or moderators may review communications only when reasonably necessary for safety purposes, moderation, abuse investigations, violation enforcement, or legal compliance. Chat content is not sold or used for advertising purposes.',
  },
  {
    title: '8. User Rights & Choices',
    content: 'Users may:',
    list: [
      'Edit or update profile information',
      'Request account deactivation',
      'Contact us regarding privacy concerns or questions',
      'Request removal of certain information where applicable by law',
    ],
    postContent:
      'Requests may be submitted through the contact information listed below.',
  },
  {
    title: "9. Children's Privacy",
    content:
      'The Platform is not intended for children under the age of 13. Users under 18 should use the Platform only with parental awareness and supervision where appropriate.\n\nIf we become aware that personal information from a child under 13 has been collected without appropriate consent, we may take steps to remove such information.',
  },
  {
    title: '10. Data Retention',
    content: 'We retain information only for as long as reasonably necessary to:',
    list: [
      'Provide Platform services',
      'Maintain operational functionality',
      'Resolve disputes or enforce policies',
      'Comply with legal obligations',
      'Protect platform integrity and safety',
    ],
  },
  {
    title: '11. Changes to This Privacy Policy',
    content:
      'We may update this Privacy Policy periodically. Updated versions will be posted on the Platform with a revised "Last Updated" date. Continued use of the Platform after changes become effective constitutes acceptance of the updated Privacy Policy.',
  },
  {
    title: '12. Contact Information',
    content:
      'If you have questions, concerns, or requests related to this Privacy Policy or your data, please contact us at:',
    contact: 'contact@quranmemorizationpartner.com',
  },
  {
    title: '13. Platform Responsibility',
    content:
      'quranmemorizationpartner is responsible for operating and maintaining the Platform in accordance with this Privacy Policy and applicable operational standards.',
  },
];

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-theme-bg text-theme-text relative transition-colors duration-300">
      <StarField />
      <IslamicPatterns />
      <Navigation />

      <main className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 mb-6">
              <Shield className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-theme-text mb-4">
              Privacy <span className="text-[#D4AF37]">Policy</span>
            </h1>
            <p className="text-theme-text-secondary text-sm">
              Last Updated: May 5, 2026
            </p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map((section, idx) => (
              <motion.section
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
                className="bg-theme-card border border-theme-border rounded-2xl p-6 md:p-8"
              >
                <h2 className="text-xl font-bold font-serif text-theme-text mb-4 text-[#D4AF37]">
                  {section.title}
                </h2>

                {section.content && (
                  <p className="text-theme-text-secondary leading-relaxed whitespace-pre-line mb-4">
                    {section.content}
                  </p>
                )}

                {'subsections' in section && section.subsections && (
                  <div className="space-y-5">
                    {section.subsections.map((sub, sIdx) => (
                      <div key={sIdx}>
                        <h3 className="font-semibold text-theme-text mb-2">{sub.subtitle}</h3>
                        <ul className="list-disc list-inside space-y-1 text-theme-text-secondary text-sm">
                          {sub.items.map((item, iIdx) => (
                            <li key={iIdx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {'list' in section && section.list && (
                  <ul className="list-disc list-inside space-y-1.5 text-theme-text-secondary text-sm mb-4">
                    {section.list.map((item, iIdx) => (
                      <li key={iIdx}>{item}</li>
                    ))}
                  </ul>
                )}

                {'postContent' in section && section.postContent && (
                  <p className="text-theme-text-secondary leading-relaxed text-sm mt-3">
                    {section.postContent}
                  </p>
                )}

                {'contact' in section && section.contact && (
                  <a
                    href={`mailto:${section.contact}`}
                    className="inline-flex items-center gap-2 mt-2 text-[#D4AF37] hover:underline font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    {section.contact}
                  </a>
                )}
              </motion.section>
            ))}
          </div>
        </div>
      </main>

      <NewFooter />
    </div>
  );
}
