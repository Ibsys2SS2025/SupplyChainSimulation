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
    const workplaces = xmlData.results?.waitinglistworkstations?.workplace || [];
    const entries = Array.isArray(workplaces) ? workplaces : [workplaces];
    let sum = 0;
    for (const wp of entries) {
      const waiting = wp.waitinglist;
      const items = Array.isArray(waiting) ? waiting : (waiting ? [waiting] : []);
      for (const w of items) {
        if (w?.$?.item === id) sum += Number(w?.$?.amount ?? 0);
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

  const getProductionP1 = (productId: string): number => {
    const planning = xmlData?.internaldata?.planning ?? [];
    const rows = Array.isArray(planning) ? planning : [planning];
    for (const p of rows) {
      const article = Array.isArray(p.article) ? p.article[0] : p.article;
      const prod = Array.isArray(p.productionP1) ? p.productionP1[0] : p.productionP1;
      if (article === productId) return Number(prod ?? 0);
    }
    return 0;
  };

  const inputs = tabInputs[productId] || {};

  useEffect(() => {
    const allIds = [productId, ...dynamicIds];
    const productionP1 = getProductionP1(productId);

    allIds.forEach(id => {
      if (!inputs[id]) {
        const sicherheitsbestand = id === productId ? productionP1 : 0;
        const warteschlange = getInitialWaitingAmount(id);
        const inBearbeitung = getInitialInProgressAmount(id);
        updateInput(productId, id, 0, sicherheitsbestand);
        updateInput(productId, id, 1, warteschlange);
        updateInput(productId, id, 2, inBearbeitung);
      } else if (id === productId) {
        updateInput(productId, id, 0, productionP1);
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
    if (isMainProduct) {
      return getProductionP1(id) + sicherheitsbestand - lagerbestand - warteschlange - inBearbeitung;
    }
    return prevTotal + prevWarteschlange + sicherheitsbestand - lagerbestand - warteschlange - inBearbeitung;
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
            <tr>
              <th scope="row">{productId}</th>
              <td>{getProductionP1(productId)}</td>
              <td></td>
              <td>+</td>
              <td></td>
              <td>{renderInput(productId, 0)}</td>
              <td>-</td>
              <td>{getAmountById(productId.replace('P', ''))}</td>
              <td>-</td>
              <td>{formatValue(inputs?.[productId]?.[1] ?? 0)}</td>
              <td>-</td>
              <td>{formatValue(inputs?.[productId]?.[2] ?? 0)}</td>
              <td>=</td>
              <td>{(() => { const total = calculateRowTotal(productId, inputs, true, 0, 0, getAmountById(productId.replace('P', ''))); lastGroupTotal = total; return Number.isInteger(total) ? total : total.toFixed(2); })()}</td>
            </tr>
            <tr><td colSpan={columns}></td></tr>
            {dynamicIds.map((id) => {
              const total = calculateRowTotal(id, inputs, false, lastGroupTotal, lastGroupWarteschlange, getAmountById(id));
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
                    <td>{getAmountById(id)}</td>
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