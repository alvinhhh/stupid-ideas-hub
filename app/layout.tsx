import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'stupid ideas hub',
  description: 'A central catalog for the drip-fed stupid ideas projects',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
