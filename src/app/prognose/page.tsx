'use client';

import React, { useMemo } from 'react';
import { useXmlData } from '@/context/XmlDataContext';
import { useTranslation } from 'react-i18next';
import Sidebar from '@/components/Sidebar';
import styles from './prognose.module.css';

// Fixes Array der Produkte
const products = ['P1', 'P2', 'P3'] as const;

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

// Nur Periode N speichern
interface StockNRow {
    article: string;
    stockN:  number;
}

export default function PrognosePlanungPage() {
    const { xmlData, setXmlData } = useXmlData();
    const { t } = useTranslation();

    if (!xmlData) {
        return <p>Keine Daten geladen. Bitte lade zuerst deine XML-Datei hoch.</p>;
    }

    // --- 1) Initialwerte für Prognose aus xmlData.results.forecast.$ ---
    const computedInitialPrognoseData: PrognoseRow[] = useMemo(() => {
        const fc = xmlData.results?.forecast?.$ as Record<string, string> | undefined;
        return products.map((prod, idx) => ({
            article:    prod,
            thisPeriod: fc ? Number(fc[`p${idx + 1}`]) || 0 : 0,
            periodN1:   0,
            periodN2:   0,
            periodN3:   0,
        }));
    }, [xmlData.results]);

    // --- 2) Initialwerte für Planung ---
    const initialPlanungData: PlanungRow[] = useMemo(() => {
        return products.map(prod => ({
            article:      prod,
            productionP1: 0,
            productionP2: 0,
            productionP3: 0,
            productionP4: 0,
        }));
    }, []);

    // --- 3) Daten aus Context oder Fallback ---
    const prognoseData: PrognoseRow[] = useMemo(() => {
        return (xmlData.internaldata?.sellwish as PrognoseRow[]) ?? computedInitialPrognoseData;
    }, [xmlData.internaldata?.sellwish, computedInitialPrognoseData]);

    const planungData: PlanungRow[] = useMemo(() => {
        return (xmlData.internaldata?.planning as PlanungRow[]) ?? initialPlanungData;
    }, [xmlData.internaldata?.planning, initialPlanungData]);

    // --- Helper: Stock-Map aus XML ---
    const stockMap = useMemo(() => {
        const map: Record<string, number> = {};
        // @ts-ignore
        xmlData.results.warehousestock.article.forEach(item => {
            const { id, amount } = item.$;
            map[id] = Number(amount) || 0;
        });
        return map;
    }, [xmlData]);

    // Berechnung Lagerbestand für beliebige Periode
    const calculateStock = (rowIdx: number, periodIdx: number): number => {
        const articleKey = products[rowIdx];
        const id         = articleKey.slice(1);
        const start      = stockMap[id] || 0;

        const foreKeys = ['thisPeriod','periodN1','periodN2','periodN3'] as const;
        const foreKey  = foreKeys[periodIdx] as keyof PrognoseRow;
        const prodKey  = (`productionP${periodIdx+1}` as keyof PlanungRow);

        const prev = periodIdx === 0
            ? start
            : calculateStock(rowIdx, periodIdx - 1);

        const prod = planungData[rowIdx][prodKey]  || 0;
        const fore = prognoseData[rowIdx][foreKey] || 0;


        // @ts-ignore
        return prev + prod - fore;
    };

    const sum = <T extends Record<string, any>>(arr: T[], key: keyof T) =>
        arr.reduce((s, item) => s + (Number(item[key]) || 0), 0);

    const sumStock = (periodIdx: number) =>
        products.reduce((s, _, idx) => s + calculateStock(idx, periodIdx), 0);

    // --- Update-Funktion für Context (inkl. stockN) ---
    const updateXmlInternaldata = (
        updatedPrognose?: PrognoseRow[],
        updatedPlanung?:  PlanungRow[],
        updatedStockN?:   StockNRow[],
    ) => {
        const newInternal = {
            ...(xmlData.internaldata || {}),
            ...(updatedPrognose && { sellwish: updatedPrognose }),
            ...(updatedPlanung  && { planning:   updatedPlanung   }),
            ...(updatedStockN  && { stockN:     updatedStockN    }),
        };
        setXmlData({ ...xmlData, internaldata: newInternal });
    };

    // --- Handler für Prognose-Änderungen ---
    const handlePrognoseChange = (
        idx: number,
        field: keyof Omit<PrognoseRow,'article'>,
        val: string
    ) => {
        const n = Number(val) || 0;
        const newPrognose = [...prognoseData];
        newPrognose[idx][field] = n;

        // stockN nach Periode N neu berechnen
        const newStockN: StockNRow[] = products.map((_, rowIdx) => ({
            article: `P${rowIdx+1}`,
            stockN:  calculateStock(rowIdx, 0),
        }));

        updateXmlInternaldata(newPrognose, undefined, newStockN);
    };

    // --- Handler für Planungs-Änderungen ---
    const handlePlanungChange = (
        idx: number,
        field: keyof PlanungRow,
        val: string
    ) => {
        const n = Number(val) || 0;
        const newPlanung = [...planungData];
        // @ts-ignore
        newPlanung[idx][field] = n;

        // stockN nach Periode N neu berechnen
        const newStockN: StockNRow[] = products.map((_, rowIdx) => ({
            article: `P${rowIdx+1}`,
            stockN:  calculateStock(rowIdx, 0),
        }));

        updateXmlInternaldata(undefined, newPlanung, newStockN);
    };

    // --- Render ---
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
                                {(['thisPeriod','periodN1','periodN2','periodN3'] as const).map(f => (
                                    <td key={f}>
                                        <input
                                            type="number"
                                            value={row[f] || ''}
                                            onChange={e => handlePrognoseChange(idx, f, e.target.value)}
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
                            <th className={styles.lagerHeader}>{t('forecast.lager')}</th>
                            <th>{t('forecast.period2')}</th>
                            <th className={styles.lagerHeader}>{t('forecast.lager')}</th>
                            <th>{t('forecast.period3')}</th>
                            <th className={styles.lagerHeader}>{t('forecast.lager')}</th>
                            <th>{t('forecast.period4')}</th>
                            <th className={styles.lagerHeader}>{t('forecast.lager')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {planungData.map((row, idx) => (
                            <tr key={row.article}>
                                <td>{row.article}</td>

                                {/* Produktion m */}
                                <td>
                                    <input
                                        type="number"
                                        value={row.productionP1 || ''}
                                        onChange={e => handlePlanungChange(idx, 'productionP1', e.target.value)}
                                        className={styles.inputCell}
                                    />
                                </td>
                                {/* Lager m (Periode N) */}
                                <td>
                                    <input
                                        type="text"
                                        readOnly
                                        value={calculateStock(idx, 0)}
                                        className={styles.readOnlyCell}
                                        tabIndex={-1}
                                    />
                                </td>

                                {/* Produktion m+1 */}
                                <td>
                                    <input
                                        type="number"
                                        value={row.productionP2 || ''}
                                        onChange={e => handlePlanungChange(idx, 'productionP2', e.target.value)}
                                        className={styles.inputCell}
                                    />
                                </td>
                                {/* Lager m+1 */}
                                <td>
                                    <input
                                        type="text"
                                        readOnly
                                        value={calculateStock(idx, 1)}
                                        className={styles.readOnlyCell}
                                        tabIndex={-1}
                                    />
                                </td>

                                {/* Produktion m+2 */}
                                <td>
                                    <input
                                        type="number"
                                        value={row.productionP3 || ''}
                                        onChange={e => handlePlanungChange(idx, 'productionP3', e.target.value)}
                                        className={styles.inputCell}
                                    />
                                </td>
                                {/* Lager m+2 */}
                                <td>
                                    <input
                                        type="text"
                                        readOnly
                                        value={calculateStock(idx, 2)}
                                        className={styles.readOnlyCell}
                                        tabIndex={-1}
                                    />
                                </td>

                                {/* Produktion m+3 */}
                                <td>
                                    <input
                                        type="number"
                                        value={row.productionP4 || ''}
                                        onChange={e => handlePlanungChange(idx, 'productionP4', e.target.value)}
                                        className={styles.inputCell}
                                    />
                                </td>
                                {/* Lager m+3 */}
                                <td>
                                    <input
                                        type="text"
                                        readOnly
                                        value={calculateStock(idx, 3)}
                                        className={styles.readOnlyCell}
                                        tabIndex={-1}
                                    />
                                </td>
                            </tr>
                        ))}
                        <tr className={styles.sumRow}>
                            <td><strong>{t('forecast.sum')}</strong></td>
                            <td><strong>{sum(planungData,'productionP1')}</strong></td>
                            <td><strong>{sumStock(0)}</strong></td>
                            <td><strong>{sum(planungData,'productionP2')}</strong></td>
                            <td><strong>{sumStock(1)}</strong></td>
                            <td><strong>{sum(planungData,'productionP3')}</strong></td>
                            <td><strong>{sumStock(2)}</strong></td>
                            <td><strong>{sum(planungData,'productionP4')}</strong></td>
                            <td><strong>{sumStock(3)}</strong></td>
                        </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
