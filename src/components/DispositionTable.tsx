'use client';

import React, { useEffect } from 'react';
import styles from '@/app/disposition/disposition.module.css';
import { useXmlData } from '@/context/XmlDataContext';
import { useTranslation } from 'react-i18next';

interface Props {
  productId: string;
  dynamicIds: string[];
  rowsWithSpacing: string[];
  rowNames: Record<string, string>;
  headline: string;
}

const MULTI_USE_IDS = ['16', '17', '26'];

export default function DispositionTable({ productId, dynamicIds, rowsWithSpacing, rowNames, headline }: Props) {
  const { xmlData, tabInputs, updateInput } = useXmlData();
  const { t } = useTranslation();
  const columns = 14;

  const getAmountById = (id: string): number => {
    const whs = xmlData.results?.warehousestock;
    const articles = Array.isArray(whs?.article) ? whs.article : [whs?.article];
    const value = articles.find((a: any) => a?.$?.id === id)?.$?.amount;
    const raw = value ? Number(value) : 0;
    return MULTI_USE_IDS.includes(id) ? raw / 3 : raw;
  };

  const getInitialWaitingAmount = (id: string): number => {
    let sum = 0;
    const workstations = xmlData.results?.waitinglistworkstations?.workplace || [];
    const entries1 = Array.isArray(workstations) ? workstations : [workstations];
    for (const wp of entries1) {
      const waiting = wp.waitinglist;
      const items = Array.isArray(waiting) ? waiting : (waiting ? [waiting] : []);
      for (const w of items) {
        if (w?.$?.item === id) sum += Number(w?.$?.amount ?? 0);
      }
    }
    const missingParts = xmlData.results?.waitingliststock?.missingpart || [];
    const entries2 = Array.isArray(missingParts) ? missingParts : [missingParts];
    for (const part of entries2) {
      const workplaces = part.workplace ? (Array.isArray(part.workplace) ? part.workplace : [part.workplace]) : [];
      for (const wp of workplaces) {
        const waiting = wp.waitinglist;
        const items = Array.isArray(waiting) ? waiting : (waiting ? [waiting] : []);
        for (const w of items) {
          if (w?.$?.item === id) sum += Number(w?.$?.amount ?? 0);
        }
      }
    }
    return MULTI_USE_IDS.includes(id) ? sum / 3 : sum;
  };

  const getInitialInProgressAmount = (id: string): number => {
    const orders = xmlData.results?.ordersinwork?.workplace || [];
    const entries = Array.isArray(orders) ? orders : [orders];
    const sum = entries.filter((o: any) => o?.$?.item === id).reduce((acc: number, o: any) => acc + Number(o?.$?.amount ?? 0), 0);
    return MULTI_USE_IDS.includes(id) ? sum / 3 : sum;
  };

  const getForecastValue = (productId: string): number => {
    const forecast = xmlData?.results?.forecast?.$;
    if (!forecast) return 0;
    const key = productId.toLowerCase();
    return Number(forecast[key]) || 0;
  };

  const getPlannedProductionP1 = (productId: string): number => {
    const planning = xmlData?.internaldata?.planning ?? [];
    const row = planning.find((p: any) => p.article === productId);
    return row ? Number(row.productionP1 ?? 0) : 0;
  };

  const inputs = tabInputs[productId] || {};

  useEffect(() => {
    const allIds = [productId, ...dynamicIds];

    allIds.forEach((id) => {
      const isMainProduct = id === productId;

      const warteschlange = getInitialWaitingAmount(isMainProduct ? productId.replace('P', '') : id);
      const inBearbeitung = getInitialInProgressAmount(isMainProduct ? productId.replace('P', '') : id);
      const lagerbestand = getAmountById(isMainProduct ? productId.replace('P', '') : id);

      if (!inputs[id]) {
        if (!isMainProduct) {
          updateInput(productId, id, 0, 100); // default Sicherheitsbestand
        }

        updateInput(productId, id, 1, warteschlange);
        updateInput(productId, id, 2, inBearbeitung);
      }

      if (isMainProduct) {
        const vertriebswunsch = getForecastValue(productId);
        const zielProduktion = getPlannedProductionP1(productId);
        const sicherheitsbestand = zielProduktion - vertriebswunsch + lagerbestand + warteschlange + inBearbeitung;
        updateInput(productId, productId, 0, sicherheitsbestand);
      }
    });
  }, [productId, dynamicIds, xmlData?.internaldata?.planning]);


  const handleInput = (id: string, idx: number, val: number) => {
    updateInput(productId, id, idx, val);
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

  const formatValue = (val: number) => Number.isInteger(val) ? val : val.toFixed(2);

  const calculateRowTotal = (
    id: string,
    inputs: Record<string, number[]>,
    isMainProduct: boolean,
    prevTotal: number,
    prevWarteschlange: number,
    lagerbestand: number
  ): number => {
    const [sicherheitsbestand, warteschlange, inBearbeitung] = inputs[id] ?? [0, 0, 0];
    let result = isMainProduct
      ? getForecastValue(id) + sicherheitsbestand - lagerbestand - warteschlange - inBearbeitung
      : prevTotal + prevWarteschlange + sicherheitsbestand - lagerbestand - warteschlange - inBearbeitung;
    return result < 0 ? 0 : result;
  };

  let lastGroupTotal = 0;
  let lastGroupWarteschlange = 0;

  return (
    <>
      <h2 className={styles.sectionTitle}>{headline}</h2>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th></th>
              <th>{t('disposition.sales_request')}</th>
              <th></th>
              <th></th>
              <th></th>
              <th>{t('disposition.stock_safety')}</th>
              <th></th>
              <th>{t('disposition.stock_old')}</th>
              <th></th>
              <th>{t('disposition.orders_queued')}</th>
              <th></th>
              <th>{t('disposition.orders_active')}</th>
              <th></th>
              <th>{t('disposition.orders_prod')}</th>
            </tr>
          </thead>

          <tbody>
            {/* Erste Zeile separat */}
            <tr>
              <th scope="row">{productId}</th>
              <td className={styles.productionCell}>{getForecastValue(productId)}</td>
              <td></td>
              <td>+</td>
              <td></td>
              <td>{formatValue(inputs?.[productId]?.[0] ?? 0)}</td>
              <td>-</td>
              <td>{getAmountById(productId.replace('P', ''))}</td>
              <td>-</td>
              <td>{formatValue(inputs?.[productId]?.[1] ?? 0)}</td>
              <td>-</td>
              <td>{formatValue(inputs?.[productId]?.[2] ?? 0)}</td>
              <td>=</td>
              <td>{(() => {
                const total = getPlannedProductionP1(productId);
                lastGroupTotal = total;
                lastGroupWarteschlange = inputs?.[productId]?.[1] ?? 0;
                return total;
              })()}</td>
            </tr>
            <tr><td colSpan={columns}></td></tr>

            {/* Alle dynamischen Zeilen */}
            {dynamicIds.map((id) => {
              const total = calculateRowTotal(
                id,
                inputs,
                false,
                lastGroupTotal,
                lastGroupWarteschlange,
                getAmountById(id)
              );
              const warteschlange = inputs?.[id]?.[1] ?? 0;
              const row = (
                <React.Fragment key={id}>
                  <tr>
                    <th scope="row">{rowNames[id] || id}</th>
                    <td>{Number.isInteger(lastGroupTotal) ? lastGroupTotal : lastGroupTotal.toFixed(2)}</td>
                    <td>+</td>
                    <td>{Number.isInteger(lastGroupWarteschlange) ? lastGroupWarteschlange : lastGroupWarteschlange.toFixed(2)}</td>
                    <td>+</td>
                    <td>{renderInput(id, 0)}</td>
                    <td>-</td>
                    <td>{MULTI_USE_IDS.includes(id) ? getAmountById(id).toFixed(2) : getAmountById(id)}</td>
                    <td>-</td>
                    <td>{formatValue(inputs?.[id]?.[1] ?? 0)}</td>
                    <td>-</td>
                    <td>{formatValue(inputs?.[id]?.[2] ?? 0)}</td>
                    <td>=</td>
                    <td>{Number.isInteger(total) ? total : total.toFixed(2)}</td>
                  </tr>
                  {rowsWithSpacing.includes(id) && (
                    <tr><td colSpan={columns}></td></tr>
                  )}
                </React.Fragment>
              );
              if (rowsWithSpacing.includes(id)) {
                lastGroupTotal = total;
                lastGroupWarteschlange = warteschlange;
              }
              return row;
            })}
          </tbody>
        </table>
        <h5>{t('disposition.multiuse_hint')}</h5>
      </div>
    </>
  );
}
