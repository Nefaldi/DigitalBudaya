import React from 'react';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata = {
  title: 'DigiCulture Care — Pelestarian Warisan Budaya Sulawesi Tengah',
  description: 'Platform Partisipatif Penyelamatan, Restorasi, dan Digitalisasi Cagar Budaya Megalitikum & Tradisi Lisan Sulawesi Tengah',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-theme="light" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('digiculture_theme');
                if (saved === 'dark') {
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flexGrow: 1, paddingTop: '64px' }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
