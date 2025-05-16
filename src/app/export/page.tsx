'use client'

import React from 'react';
import styles from './export.module.css';
import Sidebar from "@/components/Sidebar";

const ExportXMLPage: React.FC = () => {
    const handleExport = () => {
        try {
            const xmlDataRaw = localStorage.getItem("xmlData");
            if (!xmlDataRaw) {
                alert("Keine Daten im Local Storage gefunden.");
                return;
            }

            const xmlData = JSON.parse(xmlDataRaw);
            const forecastData = xmlData?.results.forecast?.$ || {};
            const inputTableData = xmlData?.internaldata?.inputtable || [];
            const capacityData = xmlData?.internaldata?.capacity as Record<string, { input: number; shift: number }> || {};
            const selldirectData = xmlData?.selldirect?.item || [];
            const orderListData = xmlData?.internaldata?.orderlist || [];

            console.log(selldirectData);

            const sellWishXml = `
    <sellwish>
        <item article="1" quantity="${forecastData.p1 || 0}"/>
        <item article="2" quantity="${forecastData.p2 || 0}"/>
        <item article="3" quantity="${forecastData.p3 || 0}"/>
    </sellwish>`;

            const selldirectXml = `
    <selldirect>
        ${selldirectData.map((item: { $: { article: string; quantity: string; price: string; penalty: string } }) =>
                `    <item article="${item.$.article}" quantity="${item.$.quantity}" price="${item.$.price}" penalty="${item.$.penalty}"/>`).join('\n')}
    </selldirect>`;

            const orderListXml = `
    <orderlist>
    ${orderListData.map((order: { article: string; menge: string; modus: string }) =>
                    `    <order article="${order.article}" quantity="${order.menge}" modus="${order.modus}"/>`
                ).join('\n')}
    </orderlist>`;
            const productionListXml = `
    <productionlist>
    ${inputTableData.map((item: { key: string; value: number }) =>
                `        <production article="${item.key}" quantity="${item.value}"/>`
            ).join('\n')}
    </productionlist>`;

            const workingTimeListXml = `
    <workingtimelist>
    ${Object.entries(capacityData).map(([station, data]: [string, { input: number; shift: number }]) =>
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

            const blob = new Blob([xmlContent.trim()], { type: "application/xml" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "export.xml";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Fehler beim Exportieren der XML:", error);
            alert("Beim Exportieren der XML ist ein Fehler aufgetreten.");
        }
    };

    return (
        <div className={styles.container}>
            <Sidebar />
            <h1 className={styles.title}>XML Export</h1>
            <p className={styles.description}>
                Hier können Sie Ihre aktuelle Planung als XML-Datei exportieren.
            </p>

            <div className={styles.form}>
                <div className={styles.button}>
                    <button className={styles.exportButton} onClick={handleExport}>
                        Exportieren
                    </button>
                </div>
            </div>

            <div className={styles.nextSteps}>
                XML wird im aktuellen Format generiert und heruntergeladen.
            </div>
        </div>
    );
};

export default ExportXMLPage;
