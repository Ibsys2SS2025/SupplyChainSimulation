'use client';

import { XmlDataProvider } from '@/context/XmlDataContext';
import Header from '@/components/Header';
import styles from './layout.module.css';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <XmlDataProvider>
      <Header />
      <main className={styles.mainContent}>{children}</main>
    </XmlDataProvider>
  );
}
