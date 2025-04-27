'use client';

import React, { useState } from 'react';
import { useXmlData } from '@/context/XmlDataContext';
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/Sidebar";
import styles from './prognose.module.css';

// 1) Definiere hier das fixe Array der Produkte, aus dem wir beide Tabellen aufbauen:
const products = ['P1','P2','P3'] as const;

interface PrognoseRow {
    article:    string;
    thisPeriod: number;
    periodN1:   number;
    periodN2:   number;
    periodN3:   number;
}

interface PlanungRow {
    article:      string;
    productionP1: number;
    productionP2: number;
    productionP3: number;
    productionP4: number;
}

export default function PrognosePlanungPage() {
    const { xmlData, setXmlData } = useXmlData();
    const { t } = useTranslation();

    // 2) Sicherstellen, dass wir geparste XML-Daten haben
    if (!xmlData) {
        return <p>Keine Daten geladen. Bitte lade zuerst deine XML-Datei hoch.</p>;
    }

    // 3) Initiale Daten für Prognose: drei Zeilen P1–P3, alle Werte = 0
    const initialPrognoseData: PrognoseRow[] = products.map(prod => ({
        article:    prod,
        thisPeriod: 0,
        periodN1:   0,
        periodN2:   0,
        periodN3:   0,
    }));

    // 4) Initiale Daten für Planung: drei Zeilen P1–P3, alle Werte = 0
    const initialPlanungData: PlanungRow[] = products.map(prod => ({
        article:      prod,
        productionP1: 0,
        productionP2: 0,
        productionP3: 0,
        productionP4: 0,
    }));

    // 5) React-State aus den Initial-Daten
    const [prognoseData, setPrognoseData] = useState<PrognoseRow[]>(initialPrognoseData);
    const [planungData, setPlanungData] = useState<PlanungRow[]>(initialPlanungData);

    // 6) Hilfsfunktion: speichert die aktuellen Prognose- und/oder Planungs-Daten ins Context-Objekt
    const updateXmlInternaldata = (
        updatedPrognose?: PrognoseRow[],
        updatedPlanung?:  PlanungRow[]
    ) => {
        const newInternalData = {
            ...(xmlData.internaldata || {}),
            ...(updatedPrognose && {
                sellwish: updatedPrognose.map(row => ({
                    article:    row.article,
                    thisPeriod: row.thisPeriod,
                    periodN1:   row.periodN1,
                    periodN2:   row.periodN2,
                    periodN3:   row.periodN3,
                })),
            }),
            ...(updatedPlanung && {
                planning: updatedPlanung.map(row => ({
                    article:      row.article,
                    productionP1: row.productionP1,
                    productionP2: row.productionP2,
                    productionP3: row.productionP3,
                    productionP4: row.productionP4,
                })),
            }),
        };

        setXmlData({
            ...xmlData,
            internaldata: newInternalData,
        });
    };

    // 7) Handler für Änderungen in der Prognose-Tabelle
    const handlePrognoseChange = (
        index: number,
        field: keyof Omit<PrognoseRow,'article'>,
        value: string
    ) => {
        const newValue = Number(value) || 0;
        const newData = [...prognoseData];
        newData[index][field] = newValue;
        setPrognoseData(newData);
        updateXmlInternaldata(newData, undefined);
    };

    // 8) Handler für Änderungen in der Planungs-Tabelle
    const handlePlanungChange = (
        index: number,
        field: keyof PlanungRow,
        value: string
    ) => {
        const newValue = Number(value) || 0;
        const newData = [...planungData];
        // @ts-ignore: TypeScript weiß hier nicht, dass field != 'article'
        newData[index][field] = newValue;
        setPlanungData(newData);
        updateXmlInternaldata(undefined, newData);
    };

    // 9) Summe über ein Feld in einer Zeilen-Liste
    const sum = <T extends Record<string, any>>(arr: T[], key: keyof T): number =>
        arr.reduce((total, item) => total + (Number(item[key]) || 0), 0);

    // 10) JSX: Tabellen rendern
    return (
        <div className={styles.pageContainer}>
            <Sidebar />
            <div className={styles.content}>

                {/* Prognose-Tabelle */}
                <h2 className={styles.sectionTitle}>{t('forecast.title')}</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>{t('forecast.product')}</th>
                            <th>{t('forecast.period')}</th>
                            <th>{t('forecast.period2')}</th>
                            <th>{t('forecast.period3')}</th>
                            <th>{t('forecast.period4')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {prognoseData.map((row, idx) => (
                            <tr key={row.article}>
                                <td>{row.article}</td>
                                {(['thisPeriod','periodN1','periodN2','periodN3'] as const).map(field => (
                                    <td key={field}>
                                        <input
                                            type="number"
                                            value={row[field] || ''}
                                            onChange={e =>
                                                handlePrognoseChange(idx, field, e.target.value)
                                            }
                                            className={styles.inputCell}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        <tr className={styles.sumRow}>
                            <td><strong>{t('forecast.sum')}</strong></td>
                            <td><strong>{sum(prognoseData,'thisPeriod')}</strong></td>
                            <td><strong>{sum(prognoseData,'periodN1')}</strong></td>
                            <td><strong>{sum(prognoseData,'periodN2')}</strong></td>
                            <td><strong>{sum(prognoseData,'periodN3')}</strong></td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                {/* Planung-Tabelle */}
                <h2 className={styles.sectionTitle}>{t('forecast.planning')}</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>{t('forecast.product')}</th>
                            <th>{t('forecast.period')}</th>
                            <th>{t('forecast.period2')}</th>
                            <th>{t('forecast.period3')}</th>
                            <th>{t('forecast.period4')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {planungData.map((row, idx) => (
                            <tr key={row.article}>
                                <td>{row.article}</td>
                                {(['productionP1','productionP2','productionP3','productionP4'] as const).map(field => (
                                    <td key={field}>
                                        <input
                                            type="number"
                                            value={row[field] || ''}
                                            onChange={e =>
                                                handlePlanungChange(idx, field, e.target.value)
                                            }
                                            className={styles.inputCell}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        <tr className={styles.sumRow}>
                            <td><strong>{t('forecast.sum')}</strong></td>
                            <td><strong>{sum(planungData,'productionP1')}</strong></td>
                            <td><strong>{sum(planungData,'productionP2')}</strong></td>
                            <td><strong>{sum(planungData,'productionP3')}</strong></td>
                            <td><strong>{sum(planungData,'productionP4')}</strong></td>
                        </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
