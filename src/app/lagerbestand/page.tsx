'use client';

import React from 'react';
import styles from './lagerbestand.module.css';
import Sidebar from '@/components/Sidebar';
import { useWarehouseStock } from '@/components/WarehouseStock';
import { useXmlData } from '@/context/XmlDataContext';

export default function LagerbestandPage() {
    const { getAmountForPart } = useWarehouseStock();
    const { xmlData } = useXmlData();

    const warehouseData = xmlData?.results?.warehousestock?.article || [];
    const articles = Array.isArray(warehouseData) ? warehouseData : [warehouseData];
    const totalStockValue = parseFloat(xmlData?.results?.warehousestock?.totalstockvalue || '0');

    return (
        <div className={styles.pageContainer}>
            <Sidebar />
            <div className={styles.content}>
                <h2 className={styles.sectionTitle}>Lagerbestände</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>Artikel-ID</th>
                            <th>Bestand</th>
                            <th>Einzelpreis (€)</th>
                            <th>Lagerwert (€)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {articles.map((item: any) => (
                            <tr key={item.$.id}>
                                <td>{item.$.id}</td>
                                <td>{item.$.amount}</td>
                                <td>{parseFloat(item.$.price).toFixed(2)}</td>
                                <td>{parseFloat(item.$.stockvalue).toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr className={styles.totalRow}>
                            <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>Gesamtlagerwert:</td>
                            <td style={{ fontWeight: 'bold' }}>{totalStockValue.toFixed(2)} €</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
