import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'BORIS Public Dashboard',
  description: 'Public MVP dashboard for BOIS/BORIS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
