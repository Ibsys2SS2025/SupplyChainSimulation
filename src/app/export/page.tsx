'use client';

import React, { useEffect, useState } from 'react';
import styles from './export.module.css';
import Sidebar from '@/components/Sidebar';
import { useTranslation } from 'react-i18next';

const ExportXMLPage: React.FC = () => {
    const [xmlData, setXmlData] = useState<any | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const raw = localStorage.getItem('xmlData');
        if (raw) {
            try {
                setXmlData(JSON.parse(raw));
            } catch {
                setXmlData(null);
            }
        }
    }, []);

    const resolveOrderType = (key: string) => {
        switch (key) {
            case '5': return 'N';
            case '4': return 'E';
            case '3': return 'JIT';
            default: return key;
        }
    };

    const handleExport = () => {
        try {
            const xmlDataRaw = localStorage.getItem('xmlData');
            if (!xmlDataRaw) {
                alert('Keine Daten im Local Storage gefunden.');
                return;
            }
            const xmlData = JSON.parse(xmlDataRaw);
            const forecastData = xmlData?.results.forecast?.$ || {};
            const inputTableData = xmlData?.internaldata?.inputtable || [];
            const capacityData = xmlData?.internaldata?.capacity || {};
            const selldirectData = xmlData?.selldirect?.item || [];
            const orderListData = xmlData?.internaldata?.orderlist || [];

            const sellWishXml = `
    <sellwish>
        <item article="1" quantity="${forecastData.p1 || 0}"/>
        <item article="2" quantity="${forecastData.p2 || 0}"/>
        <item article="3" quantity="${forecastData.p3 || 0}"/>
    </sellwish>`;

            const selldirectXml = `
<selldirect>
${selldirectData.map((item: any) => {
                const formatDecimal = (val: string) => Number(val).toFixed(1);
                const formatInt = (val: string) => Math.round(Number(val)).toString();

                return `    <item article="${item.$.article}" quantity="${formatInt(item.$.quantity)}" price="${formatDecimal(item.$.price)}" penalty="${formatDecimal(item.$.penalty)}"/>`;
            }).join('\n')}
</selldirect>
`;

            const orderListXml = `
    <orderlist>
    ${orderListData.map((order: any) =>
                `    <order article="${order.article}" quantity="${order.menge}" modus="${order.modus}"/>`
            ).join('\n')}
    </orderlist>`;

            const productionListXml = `
    <productionlist>
    ${inputTableData.map((item: any) =>
                `        <production article="${item.key}" quantity="${item.value}"/>`
            ).join('\n')}
    </productionlist>`;

            const workingTimeListXml = `
    <workingtimelist>
    ${Object.entries(capacityData)
                    .filter(([station]) => station !== '5')
                    .map(([station, data]: [string, any]) =>
                        `    <workingtime station="${station}" shift="${data.shift}" overtime="${data.input}"/>`
                    ).join('\n')}

    </workingtimelist>`;

            const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<input>
    <qualitycontrol type="no" losequantity="0" delay="0"/>
    ${sellWishXml}
    ${selldirectXml}
    ${orderListXml}
    ${productionListXml}
    ${workingTimeListXml}
</input>`;

            const blob = new Blob([xmlContent.trim()], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'input.xml';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Fehler beim Exportieren der XML:', error);
            alert('Beim Exportieren der XML ist ein Fehler aufgetreten.');
        }
    };

    return (
        <div className={styles.pageContainer}>
            <Sidebar />
            <div className={styles.content}>
                <h1 className={styles.sectionTitle}>{t('export.title')}</h1>
                <p className={styles.description}>{t('export.description')}</p>

                <div className={styles.tableGrid}>
                    {xmlData?.selldirect?.item?.length > 0 && (
                        <div className={styles.tableContainer}>
                            <h2 className={styles.sectionTitle}>{t('export.direct_sales')}</h2>
                            <table className={styles.table}>
                                <thead>
                                    <tr><th>{t('export.article')}</th><th>{t('export.quantity')}</th></tr>
                                </thead>
                                <tbody>
                                    {xmlData.selldirect.item.map((item: any, i: number) => (
                                        <tr key={i}>
                                            <td>{item.$.article}</td>
                                            <td>{item.$.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {xmlData?.internaldata?.orderlist?.length > 0 && (
                        <div className={styles.tableContainer}>
                            <h2 className={styles.sectionTitle}>{t('export.orders')}</h2>
                            <table className={styles.table}>
                                <thead>
                                    <tr><th>{t('export.article')}</th><th>{t('export.quantity')}</th><th>{t('export.mode')}</th></tr>
                                </thead>
                                <tbody>
                                    {xmlData.internaldata.orderlist.map((order: any, i: number) => (
                                        <tr key={i}>
                                            <td>{order.article}</td>
                                            <td>{order.menge}</td>
                                            <td>{resolveOrderType(order.modus)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {xmlData?.internaldata?.inputtable?.length > 0 && (
                        <div className={styles.tableContainer}>
                            <h2 className={styles.sectionTitle}>{t('export.production')}</h2>
                            <table className={styles.table}>
                                <thead>
                                    <tr><th>{t('export.article')}</th><th>{t('export.production_quantity')}</th></tr>
                                </thead>
                                <tbody>
                                    {xmlData.internaldata.inputtable.map((prod: any, i: number) => (
                                        <tr key={i}>
                                            <td>{prod.key}</td>
                                            <td>{prod.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {xmlData?.internaldata?.capacity && (
                        <div className={styles.tableContainer}>
                            <h2 className={styles.sectionTitle}>{t('export.capacity')}</h2>
                            <table className={styles.table}>
                                <thead>
                                    <tr><th>{t('export.workplace')}</th><th>{t('export.shifts')}</th><th>{t('export.overtime')}</th></tr>
                                </thead>
                                <tbody>
                                    {Object.entries(xmlData.internaldata.capacity).map(([station, data]: [string, any], i) => (
                                        <tr key={i} style={station === '5' ? { backgroundColor: '#f0f0f0', color: '#999' } : {}}>
                                            <td>{station}</td>
                                            <td>{station === '5' ? '-' : data.shift}</td>
                                            <td>{station === '5' ? '-' : data.input}</td>
                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className={styles.form}>
                    <div className={styles.button}>
                        <button className={styles.exportButton} onClick={handleExport}>
                            {t('export.export_button')}
                        </button>
                    </div>
                </div>

                <div className={styles.nextSteps}>
                    {t('export.download_hint')}
                </div>
            </div>
        </div>
    );
};

export default ExportXMLPage;