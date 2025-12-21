import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Texas Hold\'em (单机德州扑克)',
  description: 'Play Single Player Texas Hold\'em against AI opponents. A classic poker game implementation using Next.js. 免费在线玩单机德州扑克，挑战智能AI。',
  keywords: ['Texas Hold\'em', 'Poker', 'Single Player', '单机德州扑克', '德州扑克', 'Web Game'],
};

export default function TexasHoldemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
