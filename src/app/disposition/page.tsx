'use client';

import React, { useState } from 'react';
import { useXmlData } from '@/context/XmlDataContext';
import Sidebar from '@/components/Sidebar';
import DispositionTable from '@/components/DispositionTable';
import styles from './disposition.module.css';
import { useTranslation } from 'react-i18next';

const TAB_CONFIG = [
  {
    label: 'Disposition P1',
    productId: 'P1',
    dynamicIds: ['26', '51', '16', '17', '50', '4', '10', '49', '7', '13', '18'],
    headline: 'Disposition P1',
    rowNames: {
      '26': 'E26*',
      '51': 'E51',
      '16': 'E16*',
      '17': 'E17*',
      '50': 'E50',
      '4': 'E4',
      '10': 'E10',
      '49': 'E49',
      '7': 'E7',
      '13': 'E13',
      '18': 'E18',
    } as Record<string, string>
  },
  {
    label: 'Disposition P2',
    productId: 'P2',
    dynamicIds: ['26', '56', '16', '17', '55', '5', '11', '54', '8', '14', '19'],
    headline: 'Disposition P2',
    rowNames: {
      '26': 'E26*',
      '56': 'E56',
      '16': 'E16*',
      '17': 'E17*',
      '55': 'E55',
      '5': 'E5',
      '11': 'E11',
      '54': 'E54',
      '8': 'E8',
      '14': 'E14',
      '19': 'E19',
    } as Record<string, string>
  },
  {
    label: 'Disposition P3',
    productId: 'P3',
    dynamicIds: ['26', '31', '16', '17', '30', '6', '12', '29', '9', '15', '20'],
    headline: 'Disposition P3',
    rowNames: {
      '26': 'E26*',
      '31': 'E31',
      '16': 'E16*',
      '17': 'E17*',
      '30': 'E30',
      '6': 'E6',
      '12': 'E12',
      '29': 'E29',
      '9': 'E9',
      '15': 'E15',
      '20': 'E20',
    } as Record<string, string>
  } 
];

export default function DispositionPage() {
  const { xmlData } = useXmlData();
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation();

  if (!xmlData) return <p>{t('disposition.no_data')}</p>;

  const translatedTabs = [
    t('disposition.tab_p1'),
    t('disposition.tab_p2'),
    t('disposition.tab_p3')
  ];

  const { productId, dynamicIds, rowNames } = TAB_CONFIG[activeTab];

  return (
    <div className={styles.pageContainer}>
      <Sidebar />
      <div className={styles.content}>
        <div className={styles.tabContainer}>
          {TAB_CONFIG.map((tab, index) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(index)}
              className={`${styles.tabButton} ${index === activeTab ? styles.active : ''}`}
            >
              {translatedTabs[index]}
            </button>
          ))}
        </div>

        <DispositionTable
          productId={productId}
          dynamicIds={dynamicIds}
          rowNames={rowNames}
          rowsWithSpacing={['51', '50', '49', '56', '55', '54', '31', '30', '29']}
          headline={translatedTabs[activeTab]}
        />
      </div>
    </div>
  );
}
