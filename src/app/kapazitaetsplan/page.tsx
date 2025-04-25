'use client';

import React from 'react';
import { useXmlData } from '@/context/XmlDataContext';
import styles from "@/app/kapazitaetsplan/table.module.css";
import Sidebar from "@/components/Sidebar";
import {useTranslation} from "react-i18next";
import ProductTableThree from './tablerowThree';
import ProductTableOne from "@/app/kapazitaetsplan/tablerowOne";
import {
    backWheelValues,
    frontWheelValues,
    mudguardbackValues,
    mudguardfrontValues,
    barValues,
    saddleValues,
    frameValues,
    pedalValues,
    frontwheelcompleteValues,
    framewheelsValues,
    bikewithoutpedalsvalues,
    bikecompleteValues
} from './productValues';

export default function JsonViewPage() {
    const { xmlData } = useXmlData();

    if (!xmlData) {
        return <p>Keine Daten gefunden. Bitte lade zuerst deine XML-Datei.</p>;
    }

    const { t} = useTranslation();

    return (
        <div className={styles.pageContainer}>
            <Sidebar />
            <div className={styles.content}>
                <h2 className={styles.sectionTitle}>{t('capacity.title')}</h2>
                <div className={styles.tableContainer}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th></th>
                                <th colSpan={18}>{t('capacity.workstation')}</th>
                            </tr>

                            <tr>
                                <th>{t('capacity.product')}</th>
                                <th>{t('capacity.bikemodell')}</th>
                                <th>{t('capacity.itemnumber')}</th>
                                <th>{t('capacity.orderquantity')}</th>
                                <th>1</th>
                                <th>2</th>
                                <th>3</th>
                                <th>4</th>
                                <th>5</th>
                                <th>6</th>
                                <th>7</th>
                                <th>8</th>
                                <th>9</th>
                                <th>10</th>
                                <th>11</th>
                                <th>12</th>
                                <th>13</th>
                                <th>14</th>
                                <th>15</th>
                            </tr>
                            </thead>
                            <tbody>
                            <ProductTableThree
                                t={t}
                                values={backWheelValues}
                                headerText="capacity.backwheel"
                            />
                            <ProductTableThree
                                t={t}
                                values={frontWheelValues}
                                headerText="capacity.frontwheel"
                            />
                            <ProductTableThree
                                t={t}
                                values={mudguardbackValues}
                                headerText="capacity.mudguardback"
                            />
                            <ProductTableThree
                                t={t}
                                values={mudguardfrontValues}
                                headerText="capacity.mudguardfront"
                            />
                            <ProductTableOne
                                t={t}
                                values={barValues}
                                headerText="capacity.bar"
                            />
                            <ProductTableOne
                                t={t}
                                values={saddleValues}
                                headerText="capacity.saddle"
                            />
                            <ProductTableThree
                                t={t}
                                values={frameValues}
                                headerText="capacity.frame"
                            />
                            <ProductTableOne
                                t={t}
                                values={pedalValues}
                                headerText="capacity.pedal"
                            />
                            <ProductTableThree
                                t={t}
                                values={frontwheelcompleteValues}
                                headerText="capacity.frontwheelcomplete"
                            />
                            <ProductTableThree
                                t={t}
                                values={framewheelsValues}
                                headerText="capacity.framewheels"
                            />
                            <ProductTableThree
                                t={t}
                                values={bikewithoutpedalsvalues}
                                headerText="capacity.bikewithoutpedals"
                            />
                            <ProductTableThree
                                t={t}
                                values={bikecompleteValues}
                                headerText="capacity.bike"
                            />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>





        /**<div style={{ padding: '2rem' }}>
            <h2>XML-Daten als JSON</h2>
            <pre style={{
                backgroundColor: '#f5f5f5',
                padding: '1rem',
                borderRadius: '8px',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap'
            }}>
                {JSON.stringify(xmlData, null, 2)}
            </pre>
        </div>**/
    );
}