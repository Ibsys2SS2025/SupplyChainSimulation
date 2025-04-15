'use client';

import React, { useState } from 'react';
import { useXmlData } from '@/context/XmlDataContext';
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/Sidebar";
import styles from './prognose.module.css';

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

    const sellwishItems = xmlData.input?.sellwish?.item || [];

    const initialPrognoseData: PrognoseRow[] = sellwishItems.map((item: any) => {
        const existing = xmlData.internaldata?.sellwish?.find(
            (p: any) => p.article === item.$.article
        );
        return {
            article: item.$.article,
            thisPeriod: existing?.thisPeriod || 0,
            periodN1: existing?.periodN1 || 0,
            periodN2: existing?.periodN2 || 0,
            periodN3: existing?.periodN3 || 0,
        };
    });

    const [prognoseData, setPrognoseData] = useState<PrognoseRow[]>(initialPrognoseData);

    const initialPlanungData: PlanungRow[] = sellwishItems.map((item: any) => {
        const existing = xmlData.internaldata?.planning?.find(
            (p: any) => p.article === item.$.article
        );
        return {
            article: item.$.article,
            productionP1: existing?.productionP1 || 0,
            productionP2: existing?.productionP2 || 0,
            productionP3: existing?.productionP3 || 0,
            productionP4: existing?.productionP4 || 0,
        };
    });

    const [planungData, setPlanungData] = useState<PlanungRow[]>(initialPlanungData);

    const updateXmlInternaldata = (
        updatedPrognose?: PrognoseRow[],
        updatedPlanung?: PlanungRow[]
    ) => {
        const newInternalData = {
            ...(xmlData.internaldata || {}),
            ...(updatedPrognose && {
                sellwish: updatedPrognose.map((row) => ({
                    article: row.article,
                    thisPeriod: row.thisPeriod,
                    periodN1: row.periodN1,
                    periodN2: row.periodN2,
                    periodN3: row.periodN3,
                })),
            }),
            ...(updatedPlanung && {
                planning: updatedPlanung.map((row) => ({
                    article: row.article,
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

    const handlePrognoseChange = (
        index: number,
        field: keyof Omit<PrognoseRow, 'article'>,
        value: string
    ) => {
        const newValue = Number(value) || 0;
        const newData = [...prognoseData];
        newData[index][field] = newValue;
        setPrognoseData(newData);
        updateXmlInternaldata(newData, undefined);
    };

    const handlePlanungChange = (
        index: number,
        field: keyof PlanungRow,
        value: string
    ) => {
        const newValue = Number(value) || 0;
        const newData = [...planungData];
        newData[index][field] = newValue;
        setPlanungData(newData);
        updateXmlInternaldata(undefined, newData);
    };

    const sum = <T extends Record<string, any>>(arr: T[], key: keyof T): number =>
        arr.reduce((total, item) => {
            const value = Number(item[key]);
            return total + (isNaN(value) ? 0 : value);
        }, 0);

    return (
        <div className={styles.pageContainer}>
            <Sidebar />
            <div className={styles.content}>
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
                                {['thisPeriod', 'periodN1', 'periodN2', 'periodN3'].map((field) => (
                                    <td key={field}>
                                        <input
                                            type="number"
                                            value={row[field as keyof PrognoseRow] || ''}
                                            onChange={(e) =>
                                                handlePrognoseChange(
                                                    index,
                                                    field as keyof Omit<PrognoseRow, 'article'>,
                                                    e.target.value
                                                )
                                            }
                                            className={styles.inputCell}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        <tr className={styles.sumRow}>
                            <td><strong>{t('forecast.sum')}</strong></td>
                            <td><strong>{sum(prognoseData, 'thisPeriod')}</strong></td>
                            <td><strong>{sum(prognoseData, 'periodN1')}</strong></td>
                            <td><strong>{sum(prognoseData, 'periodN2')}</strong></td>
                            <td><strong>{sum(prognoseData, 'periodN3')}</strong></td>
                        </tr>
                        </tbody>
                    </table>
                </div>

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
                                {['producti1', 'productionP2', 'productionP3', 'productionP4'].map((field) => (
                                    <td key={field}>
                                        <input
                                            type="number"
                                            value={row[field as keyof PlanungRow] || ''}
                                            onChange={(e) =>
                                                handlePlanungChange(
                                                    index,
                                                    field as keyof PlanungRow,
                                                    e.target.value
                                                )
                                            }
                                            className={styles.inputCell}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        <tr className={styles.sumRow}>
                            <td><strong>{t('forecast.sum')}</strong></td>
                            <td><strong>{sum(planungData, 'productionP1')}</strong></td>
                            <td><strong>{sum(planungData, 'productionP2')}</strong></td>
                            <td><strong>{sum(planungData, 'productionP3')}</strong></td>
                            <td><strong>{sum(planungData, 'productionP4')}</strong></td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
