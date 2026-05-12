'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '../components/Navigation';
import { NewFooter } from '../components/NewFooter';
import { StarField } from '../components/StarField';
import { IslamicPatterns } from '../components/IslamicPatterns';
import { FileText, Mail } from 'lucide-react';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `Welcome to QuranMemorizationPartner ("Platform," "we," "our," or "us").

By accessing or using the Platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these Terms, you should not use the Platform.`,
  },
  {
    title: '2. Platform Purpose',
    content:
      'QuranMemorizationPartner is a platform designed to help users connect with compatible Quran memorization and study partners through profile matching, messaging, scheduling, and communication tools.\n\nThe Platform is intended for educational, community, and religious study purposes only.',
  },
  {
    title: '3. Eligibility',
    list: [
      'Users must be at least 13 years old to use the Platform.',
      'Users under 18 should use the Platform with parental awareness and supervision where appropriate.',
      'By creating an account, users confirm that the information they provide is accurate and truthful.',
    ],
  },
  {
    title: '4. User Accounts',
    content:
      'Users may create accounts using supported authentication methods, including email-based authentication.',
    subContent: 'Users are responsible for:',
    list: [
      'Maintaining the confidentiality of their account credentials',
      'All activity occurring under their account',
      'Providing accurate and updated profile information',
    ],
    postContent:
      'The Platform reserves the right to suspend, restrict, or terminate accounts that violate these Terms.',
  },
  {
    title: '5. Community Conduct',
    content: 'Users agree NOT to:',
    list: [
      'Harass, abuse, threaten, or intimidate others',
      'Share harmful, illegal, or inappropriate content',
      'Impersonate another person',
      'Use the Platform for spam or commercial solicitation',
      'Attempt unauthorized access to accounts or systems',
      'Circumvent bans, blocks, or moderation systems',
      'Misuse messaging, matching, or reporting systems',
    ],
    postContent:
      'The Platform may remove content, restrict access, or suspend users at its sole discretion to maintain safety and community integrity.',
  },
  {
    title: '6. Matching & User Interactions',
    content:
      'The Platform provides compatibility-based matching tools to connect users with potential study partners. However:',
    list: [
      'The Platform does not guarantee compatibility, outcomes, or user behavior.',
      'Users are solely responsible for their own interactions and communications.',
      'Users should exercise appropriate judgment and caution when communicating with others.',
      'The Platform is not responsible for disputes, conflicts, or interactions occurring between users.',
    ],
  },
  {
    title: '7. Messaging & Communication',
    content: 'The Platform may provide:',
    list: [
      'Real-time messaging',
      'Study partner communication',
      'Audio/video meeting integrations',
      'Notification systems',
    ],
    postContent:
      'Chats are intended to remain private between users; however, moderators or administrators may review communications when reasonably necessary for safety, moderation, abuse investigations, legal compliance, or enforcement of these Terms. Users may block, report, or disconnect from other users through available platform tools.',
  },
  {
    title: '8. Video & Third-Party Services',
    content: 'The Platform may integrate third-party services including:',
    list: [
      'Meeting/video platforms',
      'Authentication providers',
      'Email delivery providers',
      'Hosting and infrastructure providers',
    ],
    postContent:
      'Use of third-party services may also be governed by their own terms and privacy policies. The Platform is not responsible for outages, interruptions, or policies of third-party providers.',
  },
  {
    title: '9. Account Suspension & Termination',
    content: 'The Platform reserves the right to:',
    list: [
      'Suspend accounts',
      'Restrict access',
      'Remove content',
      'Issue warnings',
      'Permanently terminate accounts',
    ],
    postContent:
      'These actions may result from violations of these Terms, community safety concerns, suspicious activity, or misuse of the Platform. Users may also request account deletion subject to operational or legal retention requirements.',
  },
  {
    title: '10. Intellectual Property',
    content:
      'All platform branding, software, designs, logos, features, and content created by the Platform remain the property of QuranMemorizationPartner unless otherwise stated.\n\nUsers retain ownership of content they personally submit, but grant the Platform a limited right to display and process such content for platform functionality.',
  },
  {
    title: '11. Disclaimer of Warranties',
    content: 'The Platform is provided on an "AS IS" and "AS AVAILABLE" basis. We do not guarantee:',
    list: [
      'Uninterrupted availability',
      'Error-free operation',
      'Continuous uptime',
      'Compatibility between users',
      'Specific outcomes from use of the Platform',
    ],
    postContent: 'Users use the Platform at their own discretion and risk.',
  },
  {
    title: '12. Limitation of Liability',
    content:
      'To the maximum extent permitted by law, QuranMemorizationPartner and its operators shall not be liable for:',
    list: [
      'Indirect damages',
      'Data loss',
      'User disputes',
      'Service interruptions',
      'Unauthorized access',
      'Or any damages arising from the use or inability to use the Platform',
    ],
  },
  {
    title: '13. Privacy',
    content:
      'Use of the Platform is also governed by the Privacy Policy. By using the Platform, users acknowledge that they have reviewed and understood the Privacy Policy.',
  },
  {
    title: '14. Modifications to the Terms',
    content:
      'We may update these Terms periodically. Updated versions will be posted on the Platform with a revised "Last Updated" date. Continued use of the Platform after changes become effective constitutes acceptance of the updated Terms.',
  },
  {
    title: '15. Contact Information',
    content: 'For questions regarding these Terms, please contact:',
    contact: 'contact@quranmemorizationpartner.com',
  },
  {
    title: '16. Governing Platform Operations',
    content:
      'QuranMemorizationPartner operates and maintains the Platform subject to these Terms and applicable operational standards.',
  },
];

export function TermsPage() {
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
              <FileText className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-theme-text mb-4">
              Terms of <span className="text-[#D4AF37]">Service</span>
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
                <h2 className="text-xl font-bold font-serif mb-4 text-[#D4AF37]">
                  {section.title}
                </h2>

                {section.content && (
                  <p className="text-theme-text-secondary leading-relaxed whitespace-pre-line mb-4">
                    {section.content}
                  </p>
                )}

                {'subContent' in section && section.subContent && (
                  <p className="text-theme-text-secondary leading-relaxed mb-2">
                    {section.subContent}
                  </p>
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
                    className="inline-flex items-start sm:items-center gap-2 mt-2 text-[#D4AF37] hover:underline font-medium break-all"
                  >
                    <Mail className="w-4 h-4 flex-shrink-0 mt-1 sm:mt-0" />
                    <span>{section.contact}</span>
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
