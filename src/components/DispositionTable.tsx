import React, { useState } from 'react';
import styles from '@/app/disposition/disposition.module.css';
import { useXmlData } from '@/context/XmlDataContext';

interface Props {
  productId: string; // z.B. "P1", "P2", "P3"
  dynamicIds: string[];
  rowsWithSpacing: string[];
  rowNames: Record<string, string>;
  headline: string;
}

export default function DispositionTable({ productId, dynamicIds, rowsWithSpacing, rowNames, headline }: Props) {
  const { xmlData } = useXmlData();
  const columns = 14;

  const getAmountById = (id: string): number => {
    const whs = xmlData.results?.warehousestock;
    const articles = Array.isArray(whs?.article) ? whs.article : [whs?.article];
    const value = articles.find((a: any) => a?.$?.id === id)?.$?.amount;
    return value ? Number(value) : 0;
  };

  // 💾 Tab-spezifische Eingaben für alle Tabs
  const [tabInputs, setTabInputs] = useState<Record<string, Record<string, number[]>>>({
    P1: Object.fromEntries(['P1', '26', '51', '16', '17', '50', '4', '10', '49', '7', '13', '18'].map(id => [id, [0, 0, 0]])),
    P2: Object.fromEntries(['P2', '26', '56', '16', '17', '54', '5', '11', '53', '8', '14', '19'].map(id => [id, [0, 0, 0]])),
    P3: Object.fromEntries(['P3', '26', '66', '16', '17', '64', '6', '12', '63', '9', '15', '20'].map(id => [id, [0, 0, 0]])),
  });

  const inputs = tabInputs[productId];

  const handleInput = (id: string, idx: number, val: number) => {
    setTabInputs(prev => {
      const tab = { ...prev[productId] };
      const updated = [...(tab[id] ?? [0, 0, 0])];
      updated[idx] = val;
      return { ...prev, [productId]: { ...tab, [id]: updated } };
    });
  };

  const renderInput = (id: string, idx: number) => {
    const value = inputs?.[id]?.[idx] ?? 0;
    return (
      <input
        className={styles.inputCell}
        type="number"
        value={value}
        onChange={e => handleInput(id, idx, Number(e.target.value))}
      />
    );
  };

  const getLagerbestand = (id: string) => {
    const raw = id === productId ? getAmountById(productId.replace('P', '')) : getAmountById(id);
    return ['16', '17', '26'].includes(id) ? raw / 3 : raw;
  };

  const getPreviousId = (currentId: string): string => {
    const index = dynamicIds.indexOf(currentId);
    if (index === 0) return productId;
    for (let i = index - 1; i >= 0; i--) {
      if (rowsWithSpacing.includes(dynamicIds[i])) return dynamicIds[i];
    }
    return productId;
  };

  const getPreviousWarteschlange = (currentId: string): number => {
    const prevId = getPreviousId(currentId);
    return prevId ? inputs?.[prevId]?.[1] ?? 0 : 0;
  };

  const calculateTotal = (id: string): number => {
    const values = inputs?.[id] ?? [0, 0, 0];
    const [sicherheitsbestand, warteschlange, inBearbeitung] = values;
    const lagerbestand = getLagerbestand(id);
    let total = sicherheitsbestand - lagerbestand - warteschlange - inBearbeitung;
    if (id !== productId) {
      const prevId = getPreviousId(id);
      if (prevId) total += calculateTotal(prevId);
    }
    return total;
  };

  return (
    <>
      <h2 className={styles.sectionTitle}>{headline}</h2>
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
              <th scope="row">{productId}</th>
              <td></td>
              <td></td>
              <td>+</td>
              <td></td>
              <td>{renderInput(productId, 0)}</td>
              <td>-</td>
              <td>{getAmountById(productId.replace('P', ''))}</td>
              <td>-</td>
              <td>{renderInput(productId, 1)}</td>
              <td>-</td>
              <td>{renderInput(productId, 2)}</td>
              <td>=</td>
              <td>{calculateTotal(productId)}</td>
            </tr>
            <tr><td colSpan={columns}></td></tr>

            {dynamicIds.map((id) => {
              const total = calculateTotal(id);
              const prevId = getPreviousId(id);
              const prevTotal = prevId ? calculateTotal(prevId) : 0;
              const prevWarteschlange = getPreviousWarteschlange(id);

              return (
                <React.Fragment key={id}>
                  <tr>
                    <th scope="row">{rowNames[id] || id}</th>
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
    </>
  );
}
