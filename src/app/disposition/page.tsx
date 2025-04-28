'use client';

import React from 'react';
import { useXmlData } from '@/context/XmlDataContext';
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/Sidebar";
import styles from './disposition.module.css';

export default function JsonViewPage() {
    const { xmlData } = useXmlData();

    if (!xmlData) {
        return <p>Keine Daten gefunden. Bitte lade zuerst deine XML-Datei.</p>;
    }

    return (
        <div className={styles.pageContainer}>
            <Sidebar />
            <div className={styles.content}>

                <h2 className={styles.sectionTitle}>Disposition</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Verbindliche Aufträge / Vertriebswunsch</th>
                                <th></th>
                                <th>Geplanter Lagerbestand am Ende der Planperiode (Sicherheitsbestand)</th>
                                <th></th>
                                <th>Lagerbestand am Ende der Vorperiode</th>
                                <th></th>
                                <th>Aufträge in der Warteschlange</th>
                                <th></th>
                                <th>Aufträge in Bearbeitung</th>
                                <th></th>
                                <th>Produktionsaufträge für die kommende Periode</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row">P1</th>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                            </tr>
                            <tr><td colSpan={7}></td></tr>
                            <tr>
                                <th scope="row">E26*</th>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                            </tr>
                            <tr>
                                <th scope="row">E51</th>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                            </tr>
                            <tr><td colSpan={7}></td></tr>
                            <tr>
                                <th scope="row">E16*</th>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                            </tr>
                            <tr>
                                <th scope="row">E17*</th>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                            </tr>
                            <tr>
                                <th scope="row">E50</th>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                            </tr>
                            <tr><td colSpan={7}></td></tr>
                            <tr>
                                <th scope="row">E4</th>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                            </tr>
                            <tr>
                                <th scope="row">E10</th>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                            </tr>
                            <tr>
                                <th scope="row">E49</th>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                            </tr>
                            <tr><td colSpan={7}></td></tr>
                            <tr>
                                <th scope="row">E7</th>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                            </tr>
                            <tr>
                                <th scope="row">E13</th>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                            </tr>
                            <tr>
                                <th scope="row">E18</th>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
