"use client";

import React, { useState } from 'react';
import { useXmlData } from '@/context/XmlDataContext';
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/Sidebar";
import styles from './prognose.module.css';

//
// Typdefinitionen für die Tabellenzeilen
//
interface PrognoseRow {
    article: string;
    thisPeriod: number;
    periodN1: number;
    periodN2: number;
    periodN3: number;
}

interface PlanungRow {
    article: string;
    productionP1: number;
    productionP2: number;
    productionP3: number;
    productionP4: number;
}

export default function PrognosePlanungPage() {
    const { xmlData, setXmlData } = useXmlData();
    const { t } = useTranslation();

    if (!xmlData) {
        return <p>Keine Daten geladen. Bitte lade zuerst deine XML-Datei hoch.</p>;
    }

    // Hole die Artikel aus dem persistenten JSON (z. B. aus "sellwish")
    const sellwishItems = xmlData.input?.sellwish?.item || [];

    // Initialisiere den Prognose-State basierend auf den sellwish-Artikeln.
    // Standardmäßig sind alle Eingaben 0.
    const initialPrognoseData: PrognoseRow[] = sellwishItems.map((item: any) => ({
        article: item.$.article,
        thisPeriod: 0,
        periodN1: 0,
        periodN2: 0,
        periodN3: 0,
    }));
    const [prognoseData, setPrognoseData] = useState<PrognoseRow[]>(initialPrognoseData);

    // Initialisiere den Planung-State – hier nur mit Produktionswerten für 4 Perioden.
    const initialPlanungData: PlanungRow[] = sellwishItems.map((item: any) => ({
        article: item.$.article,
        productionP1: 0,
        productionP2: 0,
        productionP3: 0,
        productionP4: 0,
    }));
    const [planungData, setPlanungData] = useState<PlanungRow[]>(initialPlanungData);

    // Handler für Änderungen in der Prognose-Tabelle.
    const handlePrognoseChange = (
        index: number,
        field: keyof Omit<PrognoseRow, 'article'>,
        value: string
    ) => {
        const newValue = Number(value) || 0;
        const newData = [...prognoseData];
        newData[index][field] = newValue;
        setPrognoseData(newData);

        // Aktualisiere das persistente JSON: Ergänze jeweils den sellwish-Artikel um ein "prognose"-Objekt.
        const updatedSellwishItems = sellwishItems.map((item: any) => {
            if (item.$.article === newData[index].article) {
                return {
                    ...item,
                    prognose: {
                        thisPeriod: newData[index].thisPeriod,
                        periodN1: newData[index].periodN1,
                        periodN2: newData[index].periodN2,
                        periodN3: newData[index].periodN3,
                    },
                };
            }
            return item;
        });

        setXmlData({
            ...xmlData,
            input: {
                ...xmlData.input,
                sellwish: {
                    item: updatedSellwishItems,
                },
            },
        });
    };

    // Handler für Änderungen in der Planung-Tabelle.
    const handlePlanungChange = (
        index: number,
        field: keyof PlanungRow,
        value: string
    ) => {
        const newValue = Number(value) || 0;
        const newData = [...planungData];
        newData[index][field] = newValue;
        setPlanungData(newData);
    };

    // Berechnung der Summen für die Prognose-Tabelle
    const sumThisPeriod = prognoseData.reduce((sum, row) => sum + row.thisPeriod, 0);
    const sumPeriodN1 = prognoseData.reduce((sum, row) => sum + row.periodN1, 0);
    const sumPeriodN2 = prognoseData.reduce((sum, row) => sum + row.periodN2, 0);
    const sumPeriodN3 = prognoseData.reduce((sum, row) => sum + row.periodN3, 0);

    // Berechnung der Summen für die Planung-Tabelle
    const sumProductionP1 = planungData.reduce((sum, row) => sum + row.productionP1, 0);
    const sumProductionP2 = planungData.reduce((sum, row) => sum + row.productionP2, 0);
    const sumProductionP3 = planungData.reduce((sum, row) => sum + row.productionP3, 0);
    const sumProductionP4 = planungData.reduce((sum, row) => sum + row.productionP4, 0);

    return (
        <div className={styles.pageContainer}>
            {/* Sidebar – falls du eine Sidebar integriert hast */}
            <Sidebar />

            {/* Hauptinhalt */}
            <div className={styles.content}>
                {/* Überschrift/Abstand zum Header */}
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
                        {prognoseData.map((row, index) => (
                            <tr key={row.article}>
                                <td>{row.article}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={row.thisPeriod === 0 ? '' : row.thisPeriod}
                                        onChange={(e) =>
                                            handlePrognoseChange(index, 'thisPeriod', e.target.value)
                                        }
                                        className={styles.inputCell}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={row.periodN1 === 0 ? '' : row.periodN1}
                                        onChange={(e) =>
                                            handlePrognoseChange(index, 'periodN1', e.target.value)
                                        }
                                        className={styles.inputCell}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={row.periodN2 === 0 ? '' : row.periodN2}
                                        onChange={(e) =>
                                            handlePrognoseChange(index, 'periodN2', e.target.value)
                                        }
                                        className={styles.inputCell}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={row.periodN3 === 0 ? '' : row.periodN3}
                                        onChange={(e) =>
                                            handlePrognoseChange(index, 'periodN3', e.target.value)
                                        }
                                        className={styles.inputCell}
                                    />
                                </td>
                            </tr>
                        ))}
                        {/* Summenzeile für Prognose */}
                        <tr className={styles.sumRow}>
                            <td><strong>Summe</strong></td>
                            <td><strong>{sumThisPeriod}</strong></td>
                            <td><strong>{sumPeriodN1}</strong></td>
                            <td><strong>{sumPeriodN2}</strong></td>
                            <td><strong>{sumPeriodN3}</strong></td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                {/* Abstand zwischen Prognose und Planung */}
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
                        {planungData.map((row, index) => (
                            <tr key={row.article}>
                                <td>{row.article}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={row.productionP1 === 0 ? '' : row.productionP1}
                                        onChange={(e) =>
                                            handlePlanungChange(index, 'productionP1', e.target.value)
                                        }
                                        className={styles.inputCell}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={row.productionP2 === 0 ? '' : row.productionP2}
                                        onChange={(e) =>
                                            handlePlanungChange(index, 'productionP2', e.target.value)
                                        }
                                        className={styles.inputCell}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={row.productionP3 === 0 ? '' : row.productionP3}
                                        onChange={(e) =>
                                            handlePlanungChange(index, 'productionP3', e.target.value)
                                        }
                                        className={styles.inputCell}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={row.productionP4 === 0 ? '' : row.productionP4}
                                        onChange={(e) =>
                                            handlePlanungChange(index, 'productionP4', e.target.value)
                                        }
                                        className={styles.inputCell}
                                    />
                                </td>
                            </tr>
                        ))}
                        {/* Summenzeile für Planung */}
                        <tr className={styles.sumRow}>
                            <td><strong>Summe</strong></td>
                            <td><strong>{sumProductionP1}</strong></td>
                            <td><strong>{sumProductionP2}</strong></td>
                            <td><strong>{sumProductionP3}</strong></td>
                            <td><strong>{sumProductionP4}</strong></td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
