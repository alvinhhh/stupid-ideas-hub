import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stupid Ideas Catalog',
  description: 'A central catalog for the active projects',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
