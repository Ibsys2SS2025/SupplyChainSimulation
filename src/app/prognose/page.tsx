'use client';

import React from 'react';
import { useXmlData } from '@/context/XmlDataContext';
import styles from './prognose.module.css'; // Erstelle bzw. passe diese CSS-Datei an

export default function PrognosePage() {
    const { xmlData } = useXmlData();

    if (!xmlData) {
        return <p>Keine Daten geladen. Bitte lade zuerst deine XML-Datei hoch.</p>;
    }

    // Aus der persistenten JSON-Struktur holen wir jetzt die relevanten Arrays
    // Beispiel für "sellwish": [{ "$": { "article": "1", "quantity": "200" } }, ...]
    const sellwishItems = xmlData.input?.sellwish?.item || [];
    const productionList = xmlData.input?.productionlist?.production || [];

    return (
        <div className={styles.container}>
            <h1>Prognose / Produktionsplanung</h1>

            {/* Vertriebswunsch aus der Kategorie sellwish anzeigen */}
            <h2>Vertriebswunsch (Sellwish)</h2>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>Artikel</th>
                    <th>Menge</th>
                </tr>
                </thead>
                <tbody>
                {sellwishItems.map((item: any, index: number) => (
                    <tr key={index}>
                        <td>{item.$.article}</td>
                        <td>{item.$.quantity}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Produktionsliste anzeigen */}
            <h2>Produktionsliste</h2>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>Artikel</th>
                    <th>Menge</th>
                </tr>
                </thead>
                <tbody>
                {productionList.map((item: any, index: number) => (
                    <tr key={index}>
                        <td>{item.$.article}</td>
                        <td>{item.$.quantity}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
