import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Feedback System',
  description: 'Share your thoughts and feedback',
};

import GoogleWrapper from '@/components/GoogleWrapper';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <GoogleWrapper>
          <AuthProvider>
            <Header />
            <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
              {children}
            </main>
            <Toaster />
          </AuthProvider>
        </GoogleWrapper>
      </body>
    </html>
  );
}
