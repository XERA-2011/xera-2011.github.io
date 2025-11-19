'use client';

import { motion } from 'framer-motion';
import GlowCard from '@/components/ui/GlowCard';
import Link from 'next/link';

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Information Collection',
      content: 'When you sign in with Google to our service, we collect the following information:',
      items: [
        'Your Google account basic information (name, email address, profile picture)',
        'Login time and IP address',
        'Data generated while using our services'
      ]
    },
    {
      title: '2. Information Usage',
      content: 'We use the collected information for:',
      items: [
        'Providing, maintaining, and improving our services',
        'Verifying your identity and protecting account security',
        'Communicating important service-related information',
        'Analyzing service usage to optimize user experience'
      ]
    },
    {
      title: '3. Information Sharing',
      content: 'We do not sell, rent, or otherwise share your personal information with third parties, except:',
      items: [
        'With your explicit consent',
        'As required by law or regulation',
        'To protect our legitimate interests'
      ]
    },
    {
      title: '4. Data Security',
      content: 'We employ industry-standard security measures to protect your personal information, including encrypted storage and secure transmission protocols. We regularly review and update our security measures to address new threats.',
      items: []
    },
    {
      title: '5. Cookie Usage',
      content: 'We use cookies and similar technologies to maintain your login status, remember your preferences, and analyze website traffic. You can manage cookies through your browser settings.',
      items: []
    },
    {
      title: '6. Your Rights',
      content: 'You have the right to:',
      items: [
        'Access and update your personal information',
        'Delete your account and related data',
        'Withdraw consent for data processing',
        'Export your data'
      ]
    },
    {
      title: '7. Third-Party Services',
      content: 'We use Google OAuth for authentication. When you sign in with Google, your information is also subject to Google\'s privacy policy.',
      items: [],
      link: {
        text: 'Google Privacy Policy',
        url: 'https://policies.google.com/privacy'
      }
    },
    {
      title: '8. Children\'s Privacy',
      content: 'Our service is not directed to children under 13 years of age. If we discover that we have collected personal information from children, we will delete it immediately.',
      items: []
    },
    {
      title: '9. Policy Updates',
      content: 'We may update this privacy policy from time to time. For significant changes, we will notify you through the website or email. Continued use of our service indicates your acceptance of the updated policy.',
      items: []
    }
    // TODO: Add contact information
    // {
    //   title: '10. Contact Us',
    //   content: 'If you have any questions or suggestions about this privacy policy, please contact us:',
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
            Privacy Policy
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
                  {section.link && (
                    <p className="text-white/80">
                      We recommend reviewing the{' '}
                      <Link
                        href={section.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-white/80 underline underline-offset-4 transition-colors cursor-can-hover"
                      >
                        {section.link.text}
                      </Link>
                      .
                    </p>
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
