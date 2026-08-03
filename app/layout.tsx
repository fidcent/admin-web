import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wishwing Admin Web',
  description: 'Admin operations for vendor onboarding and margin controls',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
