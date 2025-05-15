'use client';

import React, { useState, useEffect } from 'react';
import styles from './direktverkauf.module.css';
import Sidebar from '@/components/Sidebar';
import { useXmlData } from '@/context/XmlDataContext';

interface DirectSaleItem {
    article: number;
    quantity: number;
    price: number;
    penalty: number;
}

const initialItems: DirectSaleItem[] = [
    { article: 1, quantity: 0, price: 0.0, penalty: 0.0 },
    { article: 2, quantity: 0, price: 0.0, penalty: 0.0 },
    { article: 3, quantity: 0, price: 0.0, penalty: 0.0 },
];

export default function DirectSalePage() {
    const { xmlData, setXmlData } = useXmlData();
    const [items, setItems] = useState<DirectSaleItem[]>(initialItems);

    const handleChange = (article: number, field: keyof DirectSaleItem, value: string) => {
        const updated = items.map(item =>
            item.article === article
                ? { ...item, [field]: field === 'article' ? Number(value) : parseFloat(value) || 0 }
                : item
        );
        setItems(updated);
    };

    useEffect(() => {
        const newXml = {
            ...xmlData,
            selldirect: {
                item: items.map(item => ({
                    $: {
                        article: item.article.toString(),
                        quantity: item.quantity.toString(),
                        price: item.price.toFixed(2),
                        penalty: item.penalty.toFixed(2),
                    },
                })),
            },
        };
        setXmlData(newXml);
    }, [items]);

    return (
        <div className={styles.pageContainer}>
            <Sidebar />
            <div className={styles.content}>
                <h2 className={styles.sectionTitle}>Direktverkauf</h2>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Artikel</th>
                        <th>Menge</th>
                        <th>Preis (€)</th>
                        <th>Konventionalstrafe (€)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map(item => (
                        <tr key={item.article}>
                            <td>{item.article}</td>
                            <td>
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={e => handleChange(item.article, 'quantity', e.target.value)}
                                    className={styles.inputCell}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={item.price}
                                    onChange={e => handleChange(item.article, 'price', e.target.value)}
                                    className={styles.inputCell}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={item.penalty}
                                    onChange={e => handleChange(item.article, 'penalty', e.target.value)}
                                    className={styles.inputCell}
                                />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
