'use client';

import React from 'react';
import styles from './lagerbestand.module.css';
import Sidebar from '@/components/Sidebar';
import { useWarehouseStock } from '@/components/WarehouseStock';

const warehouseParts = [
    { id: 1},
    { id: 2},
    { id: 3},
    { id: 4},
    { id: 5},
    { id: 6},
    { id: 7},
    { id: 8},
    { id: 9},
    { id: 10},
    { id: 11},
    { id: 12},
    { id: 13},
    { id: 14},
    { id: 15},
    { id: 16},
    { id: 17},
    { id: 18},
    { id: 19},
    { id: 20},
    { id: 21},
    { id: 22},
    { id: 23},
    { id: 24},
    { id: 25},
    { id: 26},
    { id: 27},
    { id: 28},
    { id: 32},
    { id: 33},
    { id: 34},
    { id: 35},
    { id: 36},
    { id: 37},
    { id: 38},
    { id: 39},
    { id: 40},
    { id: 41},
    { id: 42},
    { id: 43},
    { id: 44},
    { id: 46},
    { id: 47},
    { id: 48},
    { id: 52},
    { id: 57},
    { id: 58},
    { id: 59},


    // Was geht im Lager ab Homie xD heheh
];

export default function LagerbestandPage() {
    const { getAmountForPart } = useWarehouseStock();

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
                        </tr>
                        </thead>
                        <tbody>
                        {warehouseParts.map(part => (
                            <tr key={part.id}>
                                <td>{part.id}</td>
                                <td>{getAmountForPart(part.id)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
