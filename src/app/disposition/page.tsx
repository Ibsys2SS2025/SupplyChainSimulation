'use client';

import React from 'react';
import { useXmlData } from '@/context/XmlDataContext';
import Sidebar from '@/components/Sidebar';
import styles from './disposition.module.css';

export default function JsonViewPage() {
  const { xmlData } = useXmlData();
  const columns = 14;

  if (!xmlData) {
    return <p>Lade XML-Daten…</p>;
  }

  // 1) Normalisiere zu Array (auch wenn nur ein Artikel-Objekt da ist)
  const articles: any[] = ([] as any[]).concat(xmlData.results?.warehousestock?.article || []);

  // 2) Finde Artikel mit id="1" und lese den amount-Wert
  const lagerbestandP1 =
    articles.find((a: any) => a.$?.id?.trim() === '1')?.$?.amount || '-';

    return (
        <div className={styles.pageContainer}>
            <Sidebar />
            <div className={styles.content}>

                <h2 className={styles.sectionTitle}>Disposition P1</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Verbindliche Aufträge / Vertriebswunsch</th>
                                <th></th>
                                <th></th>
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
                                <td></td>
                                <td></td>
                                <td>+</td>
                                <td></td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td>{lagerbestandP1}</td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td></td>
                            </tr>
                            <tr><td colSpan={columns}></td></tr>
                            <tr>
                                <th scope="row">E26*</th>
                                <td></td>
                                <td>+</td>
                                <td></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td></td>
                            </tr>
                            <tr>
                                <th scope="row">E51</th>
                                <td></td>
                                <td>+</td>
                                <td></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td></td>
                            </tr>
                            <tr><td colSpan={columns}></td></tr>
                            <tr>
                                <th scope="row">E16*</th>
                                <td></td>
                                <td>+</td>
                                <td></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td></td>
                            </tr>
                            <tr>
                                <th scope="row">E17*</th>
                                <td></td>
                                <td>+</td>
                                <td></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td></td>
                            </tr>
                            <tr>
                                <th scope="row">E50</th>
                                <td></td>
                                <td>+</td>
                                <td></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td></td>
                            </tr>
                            <tr><td colSpan={15}></td></tr>
                            <tr>
                                <th scope="row">E4</th>
                                <td></td>
                                <td>+</td>
                                <td></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td></td>
                            </tr>
                            <tr>
                                <th scope="row">E10</th>
                                <td></td>
                                <td>+</td>
                                <td></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td></td>
                            </tr>
                            <tr>
                                <th scope="row">E49</th>
                                <td></td>
                                <td>+</td>
                                <td></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td></td>
                            </tr>
                            <tr><td colSpan={columns}></td></tr>
                            <tr>
                                <th scope="row">E7</th>
                                <td></td>
                                <td>+</td>
                                <td></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td></td>
                            </tr>
                            <tr>
                                <th scope="row">E13</th>
                                <td></td>
                                <td>+</td>
                                <td></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td></td>
                            </tr>
                            <tr>
                                <th scope="row">E18</th>
                                <td></td>
                                <td>+</td>
                                <td></td>
                                <td>+</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>-</td>
                                <td><input className={styles.inputCell} type="number" /></td>
                                <td>=</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                    <h5>* = Mehrfachverwendteile</h5>
                </div>
            </div>
        </div>
    );
}
