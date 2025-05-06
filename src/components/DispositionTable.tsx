import React, { useState, useEffect } from 'react';
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

  const [inputs, setInputs] = useState<Record<string, number[]>>({});

  // Initialisierung bei Mount oder Tab-Wechsel
  useEffect(() => {
    const allIds = [productId, ...dynamicIds];
    const initial: Record<string, number[]> = {};
    allIds.forEach(id => {
      initial[id] = [0, 0, 0];
    });
    setInputs(initial);
  }, [productId, dynamicIds]);

  const handleInput = (id: string, idx: number, val: number) => {
    setInputs(prev => {
      const updated = [...(prev[id] ?? [0, 0, 0])];
      updated[idx] = val;
      return { ...prev, [id]: updated };
    });
  };

  const renderInput = (id: string, idx: number) => {
    const value = inputs[id]?.[idx] ?? 0;
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
    return prevId ? inputs[prevId]?.[1] ?? 0 : 0;
  };

  const calculateTotal = (id: string): number => {
    const values = inputs[id] ?? [0, 0, 0];
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
