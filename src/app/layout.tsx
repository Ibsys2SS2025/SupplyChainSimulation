'use client'; // ▲ Muss ganz oben stehen!

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import Header from '@/components/Header';
import styles from './layout.module.css';

// Importiere den Provider (der ebenfalls 'use client' enthält)
import { XmlDataProvider } from '@/context/XmlDataContext';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});


export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="de">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Hier umschließt der Provider alles */}
        <XmlDataProvider>
            <Header />
            <main className={styles.mainContent}>{children}</main>
        </XmlDataProvider>
        </body>
        </html>
    );
}
