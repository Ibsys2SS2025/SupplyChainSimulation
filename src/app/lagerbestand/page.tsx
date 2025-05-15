'use client';

import React from 'react';
import styles from './lagerbestand.module.css';
import Sidebar from '@/components/Sidebar';
import { useWarehouseStock } from '@/components/WarehouseStock';
import { useXmlData } from '@/context/XmlDataContext';
import { useTranslation } from 'react-i18next';

export default function LagerbestandPage() {
    const { getAmountForPart } = useWarehouseStock();
    const { xmlData } = useXmlData();
    const { t } = useTranslation();

    const warehouseData = xmlData?.results?.warehousestock?.article || [];
    const articles = Array.isArray(warehouseData) ? warehouseData : [warehouseData];
    const totalStockValue = parseFloat(xmlData?.results?.warehousestock?.totalstockvalue || '0');

    return (
        <div className={styles.pageContainer}>
            <Sidebar />
            <div className={styles.content}>
                <h2 className={styles.sectionTitle}>{t("warehouse.title")}</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>{t("warehouse.articleId")}</th>
                            <th>{t("warehouse.amount")}</th>
                            <th>{t("warehouse.unitPrice")}</th>
                            <th>{t("warehouse.stockValue")}</th>
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
                            <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                {t("warehouse.totalStockValue")}:
                            </td>
                            <td style={{ fontWeight: 'bold' }}>{totalStockValue.toFixed(2)} €</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
