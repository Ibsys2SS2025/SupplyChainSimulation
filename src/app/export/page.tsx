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
            const capacityData = xmlData?.internaldata?.capacity || {};

            const sellWishXml = `
    <sellwish>
        <item article="1" quantity="${forecastData.p1 || 0}"/>
        <item article="2" quantity="${forecastData.p2 || 0}"/>
        <item article="3" quantity="${forecastData.p3 || 0}"/>
    </sellwish>`;

            const sellDirectXml = `
    <selldirect>
        <item article="1" quantity="0" price="0.0" penalty="0.0"/>
        <item article="2" quantity="0" price="0.0" penalty="0.0"/>
        <item article="3" quantity="0" price="0.0" penalty="0.0"/>
    </selldirect>`;

            const orderListXml = `
    <orderlist>
        <order article="21" quantity="0" modus="5"/>
        <order article="22" quantity="0" modus="5"/>
        <order article="25" quantity="0" modus="5"/>
        <order article="28" quantity="0" modus="5"/>
        <order article="32" quantity="0" modus="4"/>
        <order article="33" quantity="0" modus="5"/>
        <order article="34" quantity="0" modus="5"/>
        <order article="36" quantity="0" modus="5"/>
        <order article="37" quantity="0" modus="5"/>
        <order article="38" quantity="0" modus="5"/>
        <order article="40" quantity="0" modus="5"/>
        <order article="41" quantity="0" modus="5"/>
        <order article="42" quantity="0" modus="5"/>
        <order article="43" quantity="0" modus="5"/>
        <order article="44" quantity="0" modus="5"/>
        <order article="46" quantity="0" modus="5"/>
        <order article="47" quantity="0" modus="5"/>
        <order article="52" quantity="0" modus="5"/>
        <order article="53" quantity="0" modus="5"/>
        <order article="57" quantity="0" modus="5"/>
        <order article="58" quantity="0" modus="5"/>
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
    ${sellDirectXml}
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
