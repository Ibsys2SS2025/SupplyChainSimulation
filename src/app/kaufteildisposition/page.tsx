'use client';

import React, { useState } from 'react';
import styles from './purchasing.module.css';
import Sidebar from "@/components/Sidebar";
import { useXmlData } from '@/context/XmlDataContext';
import { useWarehouseStock } from '@/components/WarehouseStock';
import { useTranslation } from "react-i18next";

export default function Data() {
    const { xmlData } = useXmlData();
    const { getAmountForPart } = useWarehouseStock();
    const { t } = useTranslation();

    if (!xmlData) {
        return <p>Keine Daten geladen. Bitte lade zuerst deine XML-Datei hoch.</p>;
    }
    const planningData = xmlData?.internaldata?.planning || [];

    // Hilfsfunktion, um Produktion für ein Produkt (z. B. "P1") und Periode zu finden
    const getProductionAmount = (product: string, field: 'productionP1' | 'productionP2' | 'productionP3') => {
        const item = planningData.find((p: any) => p.article === product);
        return item ? Number(item[field]) : 0;
    };


    const initialRows = [
        { kaufteilId: 21, lieferfrist: 1.8, abweichung: 0.4,P1: 1, P2: 0, P3: 0 , diskontmenge: 300,bestellungMenge:0,bestellungArt:'E',lagerkosten:5.00},
        { kaufteilId: 22, lieferfrist: 1.7, abweichung: 0.4,P1: 0, P2: 1, P3: 0 , diskontmenge: 300 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:6.50},
        { kaufteilId: 23, lieferfrist: 1.2, abweichung: 0.2,P1: 0, P2: 0, P3: 1 , diskontmenge: 300 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:6.50},
        { kaufteilId: 24, lieferfrist: 3.2, abweichung: 0.3,P1: 7, P2: 7, P3: 0 ,diskontmenge: 6100 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:0.06},
        { kaufteilId: 25, lieferfrist: 0.9, abweichung: 0.2,P1: 4, P2: 4, P3: 0, diskontmenge: 3600 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:0.06},
        { kaufteilId: 26, lieferfrist: 0.9, abweichung: 0.2,P1: 4, P2: 4, P3: 0 , diskontmenge: 3600 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:0.10},
        { kaufteilId: 27, lieferfrist: 1.7, abweichung: 0.4,P1: 2, P2: 2, P3: 0 , diskontmenge: 4500 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:1.20},
        { kaufteilId: 28, lieferfrist: 2.1, abweichung: 0.5,P1: 3, P2: 3, P3: 3 , diskontmenge: 2700 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:0.75},
        { kaufteilId: 32, lieferfrist: 1.9, abweichung: 0.5,P1: 2, P2: 2, P3: 0 , diskontmenge: 1900 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:22.00},
        { kaufteilId: 33, lieferfrist: 1.6, abweichung: 0.3,P1: 0, P2: 0, P3: 72 , diskontmenge: 22000 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:0.10},
        { kaufteilId: 34, lieferfrist: 2.2, abweichung: 0.4,P1: 4, P2: 4, P3: 4 , diskontmenge: 3600 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:1.00},
        { kaufteilId: 35, lieferfrist: 1.2, abweichung: 0.1,P1: 1, P2: 1, P3: 1 , diskontmenge: 300 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:8.00},
        { kaufteilId: 36, lieferfrist: 1.5, abweichung: 0.3,P1: 1, P2: 1, P3: 1 , diskontmenge: 900 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:1.50},
        { kaufteilId: 37, lieferfrist: 1.7, abweichung: 0.4,P1: 1, P2: 1, P3: 1 , diskontmenge: 900 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:1.50},
        { kaufteilId: 38, lieferfrist: 1.5, abweichung: 0.3,P1: 2, P2: 2, P3: 2 , diskontmenge: 1800 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:2.50},
        { kaufteilId: 39, lieferfrist: 1.7, abweichung: 0.2,P1: 2, P2: 2, P3: 2 , diskontmenge: 1800 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:0.06},
        { kaufteilId: 40, lieferfrist: 0.9, abweichung: 0.2,P1: 1, P2: 1, P3: 1 , diskontmenge: 300 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:0.10},
        { kaufteilId: 41, lieferfrist: 1.2, abweichung: 0.3,P1: 2, P2: 2, P3: 2 , diskontmenge: 1800 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:5.00},
        { kaufteilId: 42, lieferfrist: 1.0, abweichung: 0.2,P1: 3, P2: 3, P3: 3 , diskontmenge: 2700 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:0.50},
        { kaufteilId: 43, lieferfrist: 1.0, abweichung: 0.3,P1: 1, P2: 1, P3: 1 , diskontmenge: 900 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:0.06},
        { kaufteilId: 44, lieferfrist: 0.9, abweichung: 0.3,P1: 1, P2: 1, P3: 1 , diskontmenge: 900 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:0.10},
        { kaufteilId: 46, lieferfrist: 1.1, abweichung: 0.1, P1: 1, P2: 1, P3: 1, diskontmenge: 900 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:3.50},
        { kaufteilId: 47, lieferfrist: 1.1, abweichung: 0.2,P1: 2, P2: 2, P3: 2, diskontmenge: 1800 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:1.50},
        { kaufteilId: 48, lieferfrist: 1.6, abweichung: 0.4,P1: 2, P2: 2, P3: 2, diskontmenge: 2200 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:22.00},
        { kaufteilId: 52, lieferfrist: 1.6, abweichung: 0.2,P1: 0, P2: 0, P3: 72, diskontmenge: 2200,bestellungMenge:0,bestellungArt:'E',lagerkosten:0.10},
        { kaufteilId: 57, lieferfrist: 1.7, abweichung: 0.3,P1: 2, P2: 2, P3: 2, diskontmenge: 2200 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:22.00},
        { kaufteilId: 58, lieferfrist: 1.6, abweichung: 0.5,P1: 0, P2: 0, P3: 72,diskontmenge: 2200 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:0.10},
        { kaufteilId: 59, lieferfrist: 0.7, abweichung: 0.2,P1: 2, P2: 2, P3: 2, diskontmenge: 2200 ,bestellungMenge:0,bestellungArt:'E',lagerkosten:0.15}
    ];
    const [tableData, setTableData] = useState(() =>
        initialRows.map(row => {
            const { P1, P2, P3 } = row;

            // Hole Produktionsmengen aus XML → jeweils für P1, P2, P3 in den vier Perioden
            const p1n  = getProductionAmount('P1', 'productionP1');
            const p1n1 = getProductionAmount('P1', 'productionP2');
            const p1n2 = getProductionAmount('P1', 'productionP3');
            // @ts-ignore
            const p1n3 = getProductionAmount('P1', 'productionP4');

            const p2n  = getProductionAmount('P2', 'productionP1');
            const p2n1 = getProductionAmount('P2', 'productionP2');
            const p2n2 = getProductionAmount('P2', 'productionP3');
            // @ts-ignore
            const p2n3 = getProductionAmount('P2', 'productionP4');

            const p3n  = getProductionAmount('P3', 'productionP1');
            const p3n1 = getProductionAmount('P3', 'productionP2');
            const p3n2 = getProductionAmount('P3', 'productionP3');
            // @ts-ignore
            const p3n3 = getProductionAmount('P3', 'productionP4');

            return {
                ...row,
                anfangsbestandPerN: getAmountForPart(row.kaufteilId),
                bruttobedarfNPlus:      P1 * p1n  + P2 * p2n  + P3 * p3n,
                bruttobedarfNPlus1:     P1 * p1n1 + P2 * p2n1 + P3 * p3n1,
                bruttobedarfNPlusZwei:  P1 * p1n2 + P2 * p2n2 + P3 * p3n2,
                bruttobedarfNPlusDrei:  P1 * p1n3 + P2 * p2n3 + P3 * p3n3,
            };
        })
    );



    const handleInputChange = (id: number, field: 'bestellungMenge' | 'bestellungArt', value: string) => {
        const newData = tableData.map(row =>
            row.kaufteilId === id
                ? { ...row, [field]: field === 'bestellungMenge' ? Number(value) : value }
                : row
        );
        setTableData(newData);
    };
    const exportOrderlistXml = () => {
        const getModus = (art: string): number => {
            switch (art) {
                case 'JIT': return 3;
                case 'E':   return 4;
                case 'N':   return 5;
                default:    return 5;
            }
        };

        const orders = tableData
            .filter(row => row.bestellungMenge > 0)
            .map(row => ({
                article: row.kaufteilId,
                quantity: row.bestellungMenge,
                modus: getModus(row.bestellungArt),
            }));

        const xmlContent =
            `<orderlist>\n` +
            orders.map(order =>
                `  <order article="${order.article}" quantity="${order.quantity}" modus="${order.modus}"/>`
            ).join('\n') +
            `\n</orderlist>`;

        console.log(xmlContent);
        alert("XML erfolgreich generiert – siehe Konsole.");
        return xmlContent;
    };

    return (
        <div className={styles.pageContainer}>
            <Sidebar />
            <div className={styles.content}>
                <h2 className={styles.sectionTitle}>Kaufteildisposition</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>Kaufteilnummer</th>
                            <th>Lieferfrist</th>
                            <th>Abweichung</th>
                            <th>P1</th>
                            <th>P2</th>
                            <th>P3</th>
                            <th>Anfangsbestand n</th>
                            <th>n</th>
                            <th>n+1</th>
                            <th>n+2</th>
                            <th>n+3</th>
                            <th>Bestellmenge</th>
                            <th>Bestellart</th>
                            <th>Lagerkosten</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tableData.map(row => (
                            <tr key={row.kaufteilId}>
                                <td>{row.kaufteilId}</td>
                                <td>{row.lieferfrist}</td>
                                <td>{row.abweichung}</td>
                                <td>{row.P1}</td>
                                <td>{row.P2}</td>
                                <td>{row.P3}</td>
                                <td>{row.anfangsbestandPerN}</td>
                                <td>{row.bruttobedarfNPlus}</td>
                                <td>{row.bruttobedarfNPlus1}</td>
                                <td>{row.bruttobedarfNPlusZwei}</td>
                                <td>{row.bruttobedarfNPlusDrei}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={row.bestellungMenge}
                                        onChange={e => handleInputChange(row.kaufteilId, 'bestellungMenge', e.target.value)}
                                        className={styles.inputCell}
                                    />
                                </td>
                                <td>
                                    <select
                                        value={row.bestellungArt}
                                        onChange={e => handleInputChange(row.kaufteilId, 'bestellungArt', e.target.value)}
                                        className={styles.inputCell}
                                    >
                                        <option value="N">N</option>
                                        <option value="E">E</option>
                                        <option value="JIT">JIT</option>
                                    </select>
                                </td>
                                <td>{row.lagerkosten}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
