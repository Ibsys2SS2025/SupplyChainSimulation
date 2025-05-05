import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { ReactNode } from 'react';
import LayoutClient from './layout.client';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Meine App',
  description: 'Dispositionstool',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
