
'use client';

import React, { useState,useEffect } from 'react';
import styles from './purchasing.module.css';
import Sidebar from "@/components/Sidebar";
import { useXmlData } from '@/context/XmlDataContext';
import { useWarehouseStock } from '@/components/WarehouseStock';
import { useTranslation } from "react-i18next";

export default function Data() {
    const { xmlData, setXmlData } = useXmlData();
    const { getAmountForPart } = useWarehouseStock();
    const { t } = useTranslation();

    const planningData = xmlData?.internaldata?.planning || [];
    const bestellungen = xmlData?.internaldata?.orderlist || [];
    const futureOrders = xmlData?.results?.futureinwardstockmovement?.order;

    const getProductionAmount = (product: string, field: 'productionP1' | 'productionP2' | 'productionP3' | 'productionP4') => {
        const item = planningData.find((p: any) => p.article === product);
        return item ? Number(item[field]) : 0;
    };

    const getFutureInwardStock = (articleId: number): { period: number, amount: number, mode: number }[] => {
        if (!futureOrders) return [];
        const list = Array.isArray(futureOrders) ? futureOrders : [futureOrders];

        return list
            .filter((o: any) => Number(o.$.article) === articleId)
            .map((o: any) => ({
                period: Number(o.$.orderperiod),
                amount: Number(o.$.amount),
                mode: Number(o.$.mode),
            }));
    };


        const initialRows = [
        { kaufteilId: 21, lieferfrist: 1.8, abweichung: 0.4,P1: 1, P2: 0, P3: 0 , diskontmenge: 300,bestellungMenge:300,bestellungArt:'E',lagerkosten:4.61},
        { kaufteilId: 22, lieferfrist: 1.7, abweichung: 0.4,P1: 0, P2: 1, P3: 0 , diskontmenge: 300 ,bestellungMenge:300,bestellungArt:'E',lagerkosten:6.02},
        { kaufteilId: 23, lieferfrist: 1.2, abweichung: 0.2,P1: 0, P2: 0, P3: 1 , diskontmenge: 300 ,bestellungMenge:300,bestellungArt:'E',lagerkosten:7.00},
        { kaufteilId: 24, lieferfrist: 3.2, abweichung: 0.3,P1: 7, P2: 7, P3: 7 ,diskontmenge: 6100 ,bestellungMenge:6100,bestellungArt:'E',lagerkosten:0.13},
        { kaufteilId: 25, lieferfrist: 0.9, abweichung: 0.2,P1: 4, P2: 4, P3: 4, diskontmenge: 3600 ,bestellungMenge:3600,bestellungArt:'E',lagerkosten:0.08},
        { kaufteilId: 27, lieferfrist: 0.9, abweichung: 0.2,P1: 2, P2: 2, P3: 2 , diskontmenge: 1800 ,bestellungMenge:1800,bestellungArt:'E',lagerkosten:0.11},
        { kaufteilId: 28, lieferfrist: 1.7, abweichung: 0.4,P1: 4, P2: 5, P3: 6 , diskontmenge: 4500 ,bestellungMenge:4500,bestellungArt:'E',lagerkosten:1.10},
        { kaufteilId: 32, lieferfrist: 2.1, abweichung: 0.5,P1: 3, P2: 3, P3: 3, diskontmenge: 2700 ,bestellungMenge:2700,bestellungArt:'E',lagerkosten:0.73},
        { kaufteilId: 33, lieferfrist: 1.9, abweichung: 0.5,P1: 0, P2: 0, P3: 2 , diskontmenge: 900 ,bestellungMenge:900 ,bestellungArt:'E',lagerkosten:22.12},
        { kaufteilId: 34, lieferfrist: 1.6, abweichung: 0.3,P1: 0, P2: 0, P3: 72 , diskontmenge: 22000 ,bestellungMenge:22000 ,bestellungArt:'E',lagerkosten:0.10},
        { kaufteilId: 35, lieferfrist: 2.2, abweichung: 0.4,P1: 4, P2: 4, P3: 4 , diskontmenge: 3600 ,bestellungMenge:3600 ,bestellungArt:'E',lagerkosten:0.92},
        { kaufteilId: 36, lieferfrist: 1.2, abweichung: 0.1,P1: 1, P2: 1, P3: 1 , diskontmenge: 900 ,bestellungMenge:900 ,bestellungArt:'E',lagerkosten:8.20},
        { kaufteilId: 37, lieferfrist: 1.5, abweichung: 0.3,P1: 1, P2: 1, P3: 1 , diskontmenge: 900 ,bestellungMenge:900 ,bestellungArt:'E',lagerkosten:1.40},
        { kaufteilId: 38, lieferfrist: 1.7, abweichung: 0.4,P1: 1, P2: 1, P3: 1, diskontmenge: 300 ,bestellungMenge:300 ,bestellungArt:'E',lagerkosten:1.45},
        { kaufteilId: 39, lieferfrist: 1.5, abweichung: 0.3,P1: 2, P2: 2, P3: 2 , diskontmenge: 900 ,bestellungMenge:900 ,bestellungArt:'E',lagerkosten:1.54},
        { kaufteilId: 40, lieferfrist: 1.7, abweichung: 0.2,P1: 1, P2: 1, P3: 1 , diskontmenge: 900 ,bestellungMenge:900 ,bestellungArt:'E',lagerkosten:2.30},
        { kaufteilId: 41, lieferfrist: 0.9, abweichung: 0.2,P1: 1, P2: 1, P3: 1 , diskontmenge: 900 ,bestellungMenge:900 ,bestellungArt:'E',lagerkosten:0.58},
        { kaufteilId: 42, lieferfrist: 1.2, abweichung: 0.3,P1: 2, P2: 2, P3: 2 , diskontmenge: 1800 ,bestellungMenge:1800 ,bestellungArt:'E',lagerkosten:0.28},
        { kaufteilId: 43, lieferfrist: 2.0, abweichung: 0.5,P1: 1, P2: 1, P3: 1 , diskontmenge: 2700 ,bestellungMenge:2700 ,bestellungArt:'E',lagerkosten:5.10},
        { kaufteilId: 44, lieferfrist: 1.0, abweichung: 0.2,P1: 3, P2: 3, P3: 3 , diskontmenge: 900 ,bestellungMenge:900 ,bestellungArt:'E',lagerkosten:0.89},
        { kaufteilId: 45, lieferfrist: 1.7, abweichung: 0.3,P1: 1, P2: 1, P3: 1 , diskontmenge: 900 ,bestellungMenge:900 ,bestellungArt:'E',lagerkosten:0.11},
        { kaufteilId: 46, lieferfrist: 0.9, abweichung: 0.3, P1: 1, P2: 1, P3: 1, diskontmenge: 900 ,bestellungMenge:900 ,bestellungArt:'E',lagerkosten:0.18},
        { kaufteilId: 47, lieferfrist: 1.1, abweichung: 0.1,P1: 1, P2: 1, P3: 1, diskontmenge: 900 ,bestellungMenge:900,bestellungArt:'E',lagerkosten:3.62},
        { kaufteilId: 48, lieferfrist: 1.0, abweichung: 0.2,P1: 2, P2: 2, P3: 2, diskontmenge: 1800 ,bestellungMenge:1800,bestellungArt:'E',lagerkosten:1.58},
        { kaufteilId: 52, lieferfrist: 1.6, abweichung: 0.4,P1: 2, P2: 0, P3: 0, diskontmenge: 600,bestellungMenge:600,bestellungArt:'E',lagerkosten:21.06},
        { kaufteilId: 53, lieferfrist: 1.6, abweichung: 0.2,P1: 72, P2: 0, P3: 0, diskontmenge: 22000,bestellungMenge:22000,bestellungArt:'E',lagerkosten:0.09},
        { kaufteilId: 57, lieferfrist: 1.7, abweichung: 0.3,P1: 0, P2: 2, P3: 0, diskontmenge: 600 ,bestellungMenge:600,bestellungArt:'E',lagerkosten:22.67},
        { kaufteilId: 58, lieferfrist: 1.6, abweichung: 0.5,P1: 0, P2: 0, P3: 72,diskontmenge: 22000 ,bestellungMenge:22000,bestellungArt:'E',lagerkosten:0.13},
        { kaufteilId: 59, lieferfrist: 0.7, abweichung: 0.2,P1: 2, P2: 2, P3: 2, diskontmenge: 1800 ,bestellungMenge:1800,bestellungArt:'E',lagerkosten:0.22}
    ];
    const getArtFromModus = (modus: string | number): string => {
        switch (Number(modus)) {
            case 3: return 'JIT';
            case 4: return 'E';
            case 5: return 'N';
            default: return '';
        }
    };



    const [tableData, setTableData] = useState(() => {

        return initialRows.map(row => {
            const existing = bestellungen.find((b: any) => Number(b.article) === row.kaufteilId);
            const { P1, P2, P3 } = row;
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
                bestellungArt: existing ? getArtFromModus(existing.modus) : '',
                bestellungMenge: existing?.menge || 0
            };
        });
    });

    const handleInputChange = (id: number, field: 'bestellungMenge' | 'bestellungArt', value: string) => {
        const newData = tableData.map(row =>
            row.kaufteilId === id
                ? { ...row, [field]: field === 'bestellungMenge' ? Number(value) : value }
                : row
        );
        setTableData(newData);
    };


    const applyDecisionLogic = () => {
        const newData = initialRows.map(row => {
            const { P1, P2, P3 } = row;
            const p1n  = getProductionAmount('P1', 'productionP1');
            const p1n1 = getProductionAmount('P1', 'productionP2');
            const p1n2 = getProductionAmount('P1', 'productionP3');
            const p1n3 = getProductionAmount('P1', 'productionP4');

            const p2n  = getProductionAmount('P2', 'productionP1');
            const p2n1 = getProductionAmount('P2', 'productionP2');
            const p2n2 = getProductionAmount('P2', 'productionP3');
            const p2n3 = getProductionAmount('P2', 'productionP4');

            const p3n  = getProductionAmount('P3', 'productionP1');
            const p3n1 = getProductionAmount('P3', 'productionP2');
            const p3n2 = getProductionAmount('P3', 'productionP3');
            const p3n3 = getProductionAmount('P3', 'productionP4');

            const anfangsbestand = getAmountForPart(row.kaufteilId);

            const bruttobedarfN     = P1 * p1n  + P2 * p2n  + P3 * p3n;
            const bruttobedarfN1    = P1 * p1n1 + P2 * p2n1 + P3 * p3n1;
            const bruttobedarfN2    = P1 * p1n2 + P2 * p2n2 + P3 * p3n2;
            const bruttobedarfN3    = P1 * p1n3 + P2 * p2n3 + P3 * p3n3;

            const totalBruttobedarf = bruttobedarfN + bruttobedarfN1 + bruttobedarfN2 + bruttobedarfN3;

            // bestellungen aus XML
            // @ts-ignore
            const futureOrders = (xmlData.results?.futureinwardstockmovement?.order || [])
                .filter((o: any ) => Number(o.$.article) === row.kaufteilId);

            let futureAmounts = [0, 0, 0, 0]; // n, n+1, n+2, n+3

            // @ts-ignore
            futureOrders.forEach((order) => {
                const modus = Number(order.$.mode);
                const amount = Number(order.$.amount);
                const arrival = Math.floor(
                    modus === 3
                        ? row.lieferfrist * 0.2
                        : modus === 4
                            ? row.lieferfrist * 0.5
                            : row.lieferfrist + row.abweichung
                );
                if (arrival >= 0 && arrival <= 3) {
                    futureAmounts[arrival] += amount;
                }
            });

            // Periodenweise verfügbarer Bestand
            const verfügbareBestände = [
                anfangsbestand + futureAmounts[0],
                futureAmounts[1],
                futureAmounts[2],
                futureAmounts[3]
            ];

            const gesamterVerfügbarerBestand = verfügbareBestände.reduce((sum, x) => sum + x, 0);

            let bestellArt: string;
            let bestellMenge: number;


            if (gesamterVerfügbarerBestand >= totalBruttobedarf) {
                bestellArt = 'kein';
                bestellMenge = 0;
            } else {
                // alte Entscheidungslogik bei Engpässen
                const lagerBisAnkunft = anfangsbestand - (bruttobedarfN + bruttobedarfN1);

                if (lagerBisAnkunft < 0) {
                    bestellArt = anfangsbestand < bruttobedarfN ? 'JIT' : 'E';
                } else {
                    bestellArt = 'N';
                }
                bestellMenge = row.diskontmenge;
            }

            return {
                ...row,
                anfangsbestandPerN: anfangsbestand,
                bruttobedarfNPlus: bruttobedarfN,
                bruttobedarfNPlus1: bruttobedarfN1,
                bruttobedarfNPlusZwei: bruttobedarfN2,
                bruttobedarfNPlusDrei: bruttobedarfN3,
                bestellungArt: bestellArt,
                bestellungMenge: bestellMenge
            };
        });

        setTableData(newData);
    };



    const getRowClass = (art: string) => {
        switch (art) {
            case 'N': return styles.nOrder;
            case 'E': return styles.eOrder;
            case 'JIT': return styles.jitOrder;
            case 'kein': return styles.noOrder;
            default: return '';
        }
    };
    const [gesamtBestellwert, setGesamtBestellwert] = useState(0);
    useEffect(() => {
        const getModus = (art: string): number => {
            switch (art) {
                case 'JIT': return 3;
                case 'E': return 4;
                case 'N': return 5;
                default: return 5;
            }
        };

        const bestellungArray = tableData
            .filter(row => row.bestellungArt !== 'kein' && row.bestellungMenge > 0)
            .map(row => ({
                article: row.kaufteilId.toString(),
                menge: row.bestellungMenge.toString(),
                modus: getModus(row.bestellungArt).toString()
            }));



        const summe = tableData.reduce((sum, row) => {
            if (row.bestellungArt !== 'kein' && row.bestellungMenge > 0) {
                return sum + row.bestellungMenge * row.lagerkosten;
            }
            return sum;
        }, 0);

        setGesamtBestellwert(summe);

        const newXml = {
            ...xmlData,
            internaldata: {
                ...(xmlData.internaldata || {}),
                orderlist: bestellungArray
            }
        };

        setXmlData(newXml);
    }, [tableData]);



    return (
        <div className={styles.pageContainer}>
            <Sidebar />
            <div className={styles.content}>
                <h2 className={styles.sectionTitle}>{t("nav.orders")}</h2>
                <button onClick={applyDecisionLogic} className={styles.calculateButton}>
                    {t("extra.button_save")}
                </button>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>{t("columns.partNumber")}</th>
                            <th>{t("columns.deliveryTime")}</th>
                            <th>{t("columns.deviation")}</th>
                            <th>{t("columns.discount quantity")}</th>
                            <th>{t("columns.p1")}</th>
                            <th>{t("columns.p2")}</th>
                            <th>{t("columns.p3")}</th>
                            <th>{t("columns.initialStock")}</th>
                            <th>{t("columns.n")}</th>
                            <th>{t("columns.n1")}</th>
                            <th>{t("columns.n2")}</th>
                            <th>{t("columns.n3")}</th>
                            <th>{t("columns.orderAmount")}</th>
                            <th>{t("columns.orderType")}</th>
                            <th>{t("columns.storageCost")}</th>
                            <th>{t("columns.order")}</th> {/* Neue Spalte */}
                        </tr>
                        </thead>
                        <tbody>
                        {tableData.map(row => (
                            <tr key={row.kaufteilId} className={getRowClass(row.bestellungArt)}>
                                <td>{row.kaufteilId}</td>
                                <td>{row.lieferfrist}</td>
                                <td>{row.abweichung}</td>
                                <td>{row.diskontmenge}</td>
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
                                        type="text"
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
                                        <option value="N">{t("orderTypes.normal")} </option>
                                        <option value="E">{t("orderTypes.rush")} </option>
                                        <option value="JIT">{t("orderTypes.justinTime")} </option>
                                        <option value="kein">{t("orderTypes.none")} </option>
                                    </select>
                                </td>
                                <td>{row.lagerkosten}</td>
                                <td>
                                    {getFutureInwardStock(row.kaufteilId).length > 0 && (
                                        <span
                                            title={
                                                getFutureInwardStock(row.kaufteilId)
                                                    .map(order =>
                                                        `${order.amount}`
                                                    )
                                                    .join('\n')
                                            }
                                            style={{color: "orange", fontWeight: "bold"}}
                                        >
                                        📦
                                    </span>
                                    )}
                                </td>

                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className={styles.totalCost}>
                    <strong>{t("extra.totalOrderValue")}:</strong> {gesamtBestellwert.toFixed(2)} €
                </div>
            </div>
        </div>
    );
}
