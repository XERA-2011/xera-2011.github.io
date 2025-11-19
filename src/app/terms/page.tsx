'use client';

import { motion } from 'framer-motion';
import GlowCard from '@/components/ui/GlowCard';
import Link from 'next/link';

export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'Welcome to our service. By accessing or using this website, you agree to comply with these Terms of Service. If you do not agree with these terms, please do not use our service.',
      items: []
    },
    {
      title: '2. Service Description',
      content: 'We provide online tools and services. We reserve the right to modify, suspend, or terminate the service at any time without prior notice.',
      items: []
    },
    {
      title: '3. User Accounts',
      content: 'Using certain features requires creating an account. You must:',
      items: [
        'Provide accurate and complete information',
        'Maintain account security',
        'Be responsible for all activities under your account',
        'Promptly notify us of any unauthorized use'
      ]
    },
    {
      title: '4. User Conduct',
      content: 'When using our service, you must not:',
      items: [
        'Violate any laws or regulations',
        'Infringe on others\' intellectual property rights',
        'Upload malware or viruses',
        'Interfere with or disrupt the normal operation of the service',
        'Access others\' accounts or systems without authorization'
      ]
    },
    {
      title: '5. Intellectual Property',
      content: 'All content on this website, including but not limited to text, graphics, logos, images, audio, video, and software, is the property of us or our content providers and is protected by copyright law.',
      items: []
    },
    {
      title: '6. Disclaimer',
      content: 'The service is provided "as is" without any express or implied warranties. We do not guarantee that the service will be uninterrupted, timely, secure, or error-free.',
      items: []
    },
    {
      title: '7. Limitation of Liability',
      content: 'To the maximum extent permitted by law, we are not liable for any indirect, incidental, special, consequential, or punitive damages.',
      items: []
    },
    {
      title: '8. Changes to Terms',
      content: 'We reserve the right to modify these terms at any time. Significant changes will be announced on the website. Continued use of the service indicates your acceptance of the modified terms.',
      items: []
    },
    {
      title: '9. Termination',
      content: 'We may suspend or terminate your account at any time for any reason, including violation of these terms. Upon termination, your right to use the service will immediately cease.',
      items: []
    }
    // TODO: Add contact information
    // {
    //   title: '10. Contact Us',
    //   content: 'If you have any questions about these terms, please contact us:',
    //   items: [],
    //   contact: 'support@xera-2011.com'
    // }
  ];

  return (
    <div className="relative w-full min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Page Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-white/60">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlowCard className="bg-black/40 backdrop-blur-sm p-8 sm:p-12">
            <div className="space-y-10">
              {sections.map((section, index) => (
                <div key={index} className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-semibold text-white">
                    {section.title}
                  </h2>
                  <p className="text-white/80 leading-relaxed">
                    {section.content}
                  </p>
                  {section.items.length > 0 && (
                    <ul className="space-y-2 pl-6">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-white/70 relative before:content-['•'] before:absolute before:-left-4 before:text-white/50">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* TODO: Add contact information */}
                  {/* {section.contact && (
                    <p className="text-white/80">
                      Email:{' '}
                      <a
                        href={`mailto:${section.contact}`}
                        className="text-white hover:text-white/80 underline underline-offset-4 transition-colors cursor-can-hover"
                      >
                        {section.contact}
                      </a>
                    </p>
                  )} */}
                </div>
              ))}
            </div>
          </GlowCard>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link
            href="/"
            className="cursor-can-hover inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
