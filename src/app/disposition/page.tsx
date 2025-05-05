'use client';

import React, { useState } from 'react';
import { useXmlData } from '@/context/XmlDataContext';
import Sidebar from '@/components/Sidebar';
import styles from './disposition.module.css';

export default function JsonViewPage() {
    const { xmlData } = useXmlData();
    const columns = 14;

    if (!xmlData) return <p>Lade XML-Daten…</p>;

    const getAmountById = (id: string): number => {
        const whs = xmlData.results?.warehousestock;
        const articles = Array.isArray(whs?.article) ? whs.article : [whs?.article];
        const value = articles.find((a: any) => a?.$?.id === id)?.$?.amount;
        return value ? Number(value) : 0;
    };

    const dynamicIds = ['26', '51', '16', '17', '50', '4', '10', '49', '7', '13', '18'];
    const rowsWithSpacing = ['51', '50', '49'];

    const [inputs, setInputs] = useState<Record<string, number[]>>(() =>
        Object.fromEntries(['P1', ...dynamicIds].map(id => [id, [0, 0, 0]]))
    );

    const handleInput = (id: string, idx: number, val: number) => {
        setInputs(prev => {
            const updated = [...prev[id]];
            updated[idx] = val;
            return { ...prev, [id]: updated };
        });
    };

    const renderInput = (id: string, idx: number) => (
        <input
            className={styles.inputCell}
            type="number"
            value={inputs[id][idx]}
            onChange={e => handleInput(id, idx, Number(e.target.value))}
        />
    );

    const getLagerbestand = (id: string) => {
        const raw = id === 'P1' ? getAmountById('1') : getAmountById(id);
        return ['16', '17', '26'].includes(id) ? raw / 3 : raw;
    };

    const calculateTotal = (id: string): number => {
        const [sicherheitsbestand, warteschlange, inBearbeitung] = inputs[id];
        const lagerbestand = getLagerbestand(id);

        let total = sicherheitsbestand - lagerbestand - warteschlange - inBearbeitung;

        if (id !== 'P1') {
            const prevId = getPreviousId(id);
            if (prevId) total += calculateTotal(prevId);
        }

        return total;
    };

    const getPreviousId = (currentId: string): string => {
        const index = dynamicIds.indexOf(currentId);
    
        // Sonderfall: ganz erste dynamische Zeile → P1 als Vorgänger
        if (index === 0) return 'P1';
    
        for (let i = index - 1; i >= 0; i--) {
            if (rowsWithSpacing.includes(dynamicIds[i])) {
                return dynamicIds[i];
            }
        }
    
        // Wenn keine Leerzeile dazwischen → P1
        return 'P1';
    };    

    const getPreviousWarteschlange = (currentId: string): number => {
        const prevId = getPreviousId(currentId);
        return prevId ? inputs[prevId]?.[1] ?? 0 : 0;
    };

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
                            {/* Erste Zeile manuell */}
                            <tr>
                                <th scope="row">P1</th>
                                <td></td>
                                <td></td>
                                <td>+</td>
                                <td></td>
                                <td>{renderInput('P1', 0)}</td>
                                <td>-</td>
                                <td>{getAmountById('1')}</td>
                                <td>-</td>
                                <td>{renderInput('P1', 1)}</td>
                                <td>-</td>
                                <td>{renderInput('P1', 2)}</td>
                                <td>=</td>
                                <td>{calculateTotal('P1')}</td>
                            </tr>
                            <tr><td colSpan={columns}></td></tr>

                            {/* Dynamisch */}
                            {dynamicIds.map((id, index) => {
                                const total = calculateTotal(id);
                                const prevId = getPreviousId(id);
                                const prevTotal = prevId ? calculateTotal(prevId) : 0;
                                const prevWarteschlange = getPreviousWarteschlange(id);

                                return (
                                    <React.Fragment key={id}>
                                        <tr>
                                            <th scope="row">E{id}{['16', '17', '26'].includes(id) ? '*' : ''}</th>
                                            <td>{prevTotal}</td>
                                            <td>+</td>
                                            <td>{prevWarteschlange}</td>
                                            <td>+</td>
                                            <td>{renderInput(id, 0)}</td>
                                            <td>-</td>
                                            <td>{getLagerbestand(id)}</td>
                                            <td>-</td>
                                            <td>{renderInput(id, 1)}</td>
                                            <td>-</td>
                                            <td>{renderInput(id, 2)}</td>
                                            <td>=</td>
                                            <td>{total}</td>
                                        </tr>
                                        {rowsWithSpacing.includes(id) && (
                                            <tr><td colSpan={columns}></td></tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                    <h5>* = Mehrfachverwendteile</h5>
                </div>
            </div>
        </div>
    );
}
