'use client';

import React from 'react';
import { useXmlData } from '@/context/XmlDataContext';
import styles from "@/app/kapazitaetsplan/table.module.css";
import Sidebar from "@/components/Sidebar";
import {useTranslation} from "react-i18next";
import ProductTableThree from './tablerowThree';
import ProductTableOne from "@/app/kapazitaetsplan/tablerowOne";
import {
    backWheelValues,
    frontWheelValues,
    mudguardbackValues,
    mudguardfrontValues,
    barValues,
    saddleValues,
    frameValues,
    pedalValues,
    frontwheelcompleteValues,
    framewheelsValues,
    bikewithoutpedalsvalues,
    bikecompleteValues
} from './productValues';

interface ProductComponent {
    label: string;
    code: string;
    value: number;
    extraValues: (string | number)[];
    setuptime: (string | number)[];
}

const calculateColumnSums = (productComponents: ProductComponent[]) => {
    const sums = Array(15).fill(0);

    productComponents.forEach(component => {
        component.extraValues.forEach((extraValue, index) => {
            if (typeof extraValue === 'number') {
                sums[index] += extraValue * component.value;
            }
        });
    });
    return sums;
};

function calculateSetupTimePerWorkplace(...valueGroups: ProductComponent[][]): number[] {
    const totalWorkplaces = 15;
    const result: number[] = new Array(totalWorkplaces).fill(0);

    for (const group of valueGroups) {
        for (const item of group) {
            item.setuptime.forEach((value, index) => {
                const numericValue = typeof value === "string" ? parseFloat(value) : value;
                if (!isNaN(numericValue)) {
                    result[index] += numericValue;
                }
            });
        }
    }

    return result;
}

const getWartezeitArbeitsplatz = (id: number, xmlData: any): number => {
    if (!xmlData || !xmlData.results || !xmlData.results.waitinglistworkstations) {
        console.log("xmlData oder waitinglistworkstations fehlt");
        return 0;
    }

    console.log(xmlData);

    const workplaces = xmlData.results.waitinglistworkstations.workplace;

    if (!workplaces || workplaces.length === 0) {
        console.log("Keine Arbeitsplätze gefunden");
        return 0;
    }

    const workplaceList = Array.isArray(workplaces) ? workplaces : [workplaces];

    // Durchlaufen der Arbeitsplätze
    for (const workplace of workplaceList) {
        // Zugriff auf das "$" Objekt
        const workplaceDetails = workplace["$"];
        if (workplaceDetails) {
            const workplaceId = parseInt(workplaceDetails.id, 10); // ID als Zahl
            const timeneed = parseInt(workplaceDetails.timeneed, 10); // timeneed als Zahl

            // Überprüfen, ob die ID übereinstimmt
            if (workplaceId === id) {
                console.log(`Gefundener Arbeitsplatz mit ID: ${id}, timeneed: ${timeneed}`);
                return timeneed || 0; // Rückgabe von timeneed, oder 0, falls nicht vorhanden
            }
        }
    }

    console.log(`Kein Arbeitsplatz mit ID ${id} gefunden`);
    return 0;
};

const getWartezeitArbeitsplatzDetail = (id: number, xmlData: any): { [key: number]: number } => {
    // Sicherstellen, dass xmlData und die notwendigen Strukturen vorhanden sind
    if (!xmlData || !xmlData.results || !xmlData.results.waitinglistworkstations) {
        console.log("xmlData oder waitinglistworkstations fehlt");
        return {}; // Rückgabe eines leeren Objekts im Fehlerfall
    }

    console.log("XML Data:", xmlData);  // Weitere Debug-Ausgabe, um die gesamte XML-Datenstruktur zu sehen

    // Abrufen der Arbeitsplätze aus der XML-Datenstruktur
    const workplaces = xmlData.results.waitinglistworkstations.workplace;

    // Wenn keine Arbeitsplätze vorhanden sind
    if (!workplaces || workplaces.length === 0) {
        console.log("Keine Arbeitsplätze gefunden");
        return {}; // Rückgabe eines leeren Objekts
    }

    // Sicherstellen, dass workplaces entweder ein Array oder ein einzelnes Objekt ist
    const workplaceList = Array.isArray(workplaces) ? workplaces : [workplaces];

    const dic: { [key: number]: number } = {};

    // Debug-Ausgabe, um die Liste der Arbeitsplätze zu überprüfen
    console.log("Workplace List:", workplaceList);

    // Durchlaufen der Arbeitsplätze
    for (const workplace of workplaceList) {
        const workplaceId = parseInt(workplace["$"].id);

        // Überprüfen, ob die id des Arbeitsplatzes mit der gesuchten id übereinstimmt
        console.log("Vergleich ID:", workplaceId, "mit gesuchter ID:", id);

        if (workplaceId === id) {
            // Nur den Arbeitsplatz berücksichtigen, wenn die ID übereinstimmt
            console.log("Arbeitsplatz gefunden:", workplace);

            // Abrufen der Warteliste für diesen Arbeitsplatz
            const workplaceDetailWaitingList = workplace.waitinglist;

            console.log("Warteliste für diesen Arbeitsplatz:", workplaceDetailWaitingList);

            // Wenn eine Warteliste existiert
            if (workplaceDetailWaitingList) {

                console.log("Wartelisten-Details:", workplaceDetailWaitingList);

                if (Array.isArray(workplaceDetailWaitingList)) {
                    // Durchlaufen der Wartelisten-Details
                    for (const workplaceDetail of workplaceDetailWaitingList) {
                        // Zugriff auf das tatsächliche Objekt im `$`
                        const item = workplaceDetail["$"].item;
                        const timeneed = workplaceDetail["$"].timeneed;

                        console.log("Item:", item, "Timeneed:", timeneed);

                        // Hinzufügen der Daten zum Dictionary
                        dic[parseInt(item)] = parseInt(timeneed);
                    }
                } else if (workplaceDetailWaitingList) {
                    // Falls es ein einzelnes Objekt ist und KEIN Array
                    const item = workplaceDetailWaitingList["$"].item;
                    const timeneed = workplaceDetailWaitingList["$"].timeneed;
                    dic[parseInt(item)] = parseInt(timeneed);
                }
            }
        }
    }

    // Rückgabe des Dictionary mit den gefundenen Daten
    console.log("Endgültiges Dictionary:", dic);  // Ausgabe des finalen Dictionary
    return dic;
};

const getRuestzeitOld=(xmlData: any, ...valueGroups: ProductComponent[][]):number[] => {
    const ruestzeit: number[] = [];
    let summe: number = 0;
    for (let i = 1; i < 16; i++) {
        const dic = getWartezeitArbeitsplatzDetail(i, xmlData);
        Object.entries(dic).forEach(([key, value]) => {
            for (const group of valueGroups) {
                for (const item of group) {
                    console.log("Arbeitsplatz: ", i, "Produktnummer: ", item.code, "Key: ", key)
                    if(item.code == key){
                        console.log("Arbeitsplatz: ", i, "Key: ", key, "Rüstzeit: ", item.setuptime[i-1]);
                        if (typeof item.setuptime[i-1] === "string") {
                            summe += parseInt(String(item.setuptime[i - 1]));
                        }
                        else{
                            summe += Number(item.setuptime[i-1]);
                        }
                    }
                }
            }
        })
        ruestzeit.splice(i-1, 0, summe);
        summe = 0;
    }

    return ruestzeit;
}


const getWartezeitArbeitsplatzGesamt=(xmlData: any, id: number):number => {
    let summe: number = 0;

    if(id == 6 || id == 1 || id == 2 || id == 3 || id == 4 || id == 10 || id == 13){
        summe += getWartezeitArbeitsplatz(id, xmlData);
    }

    if(id == 15){
        const dic = getWartezeitArbeitsplatzDetail(7, xmlData);

        console.log(dic);
         if (dic) {
            for (const index in dic) {
                if (dic.hasOwnProperty(index)) {
                    if(parseInt(index) == 26){
                        summe += dic[index];
                    }
                }
            }
        }
         summe += getWartezeitArbeitsplatz(id, xmlData);
    }

    if(id == 14){
        const dic = getWartezeitArbeitsplatzDetail(6, xmlData);
        console.log(dic);
        if (dic) {
            for (const index in dic) {
                if (dic.hasOwnProperty(index)) {
                    if(parseInt(index) == 16){
                        summe += dic[index];
                    }
                }
            }
        }
        summe += getWartezeitArbeitsplatz(id, xmlData);
    }

    if(id == 12){
        const wartezeit = getWartezeitArbeitsplatz(13, xmlData);
        if (wartezeit) {
            summe += wartezeit;
        }
        summe += getWartezeitArbeitsplatz(id, xmlData);
    }

    if(id == 11){
        const wartezeit = getWartezeitArbeitsplatz(10, xmlData);
        if (wartezeit) {
            summe += wartezeit;
        }
        summe += getWartezeitArbeitsplatz(id, xmlData);
    }

    if(id == 8){
        const wartezeitSechsDic = getWartezeitArbeitsplatzDetail(6, xmlData);
        const wartezeitDreizehn = getWartezeitArbeitsplatz(13, xmlData);
        const wartezeitZwoelf = getWartezeitArbeitsplatz(12, xmlData);

        summe+= wartezeitZwoelf + wartezeitDreizehn;

        if (wartezeitSechsDic) {
            for (const index in wartezeitSechsDic) {
                if (wartezeitSechsDic.hasOwnProperty(index)) {
                    if(parseInt(index) == 18 || parseInt(index) == 19 || parseInt(index) == 20){
                        summe += wartezeitSechsDic[index];
                    }
                }
            }
        }
    }

    if(id == 7){
        const wartezeitSechsDic = getWartezeitArbeitsplatzDetail(6, xmlData);
        const wartezeitDreizehn = getWartezeitArbeitsplatz(13, xmlData);
        const wartezeitZwoelf = getWartezeitArbeitsplatz(12, xmlData);
        const wartezeitAcht = getWartezeitArbeitsplatz(8, xmlData);
        const wartezeitSiebenDic = getWartezeitArbeitsplatzDetail(7, xmlData);

        summe+= wartezeitZwoelf + wartezeitDreizehn + wartezeitAcht;

        if (wartezeitSechsDic) {
            for (const index in wartezeitSechsDic) {
                if (wartezeitSechsDic.hasOwnProperty(index)) {
                    if(parseInt(index) == 18 || parseInt(index) == 19 || parseInt(index) == 20){
                        summe += wartezeitSechsDic[index];
                    }
                }
            }
        }

        if (wartezeitSiebenDic) {
            for (const index in wartezeitSiebenDic) {
                if (wartezeitSiebenDic.hasOwnProperty(index)) {
                    if(parseInt(index) == 18 || parseInt(index) == 19 || parseInt(index) == 20 || parseInt(index) == 10 || parseInt(index) == 11 || parseInt(index) == 12 || parseInt(index) == 13 || parseInt(index) == 14 || parseInt(index) == 15){
                        summe += wartezeitSiebenDic[index];
                    }
                }
            }
        }
    }

    if(id == 9){
        const wartezeitSechsDic = getWartezeitArbeitsplatzDetail(6, xmlData);
        const wartezeitDreizehn = getWartezeitArbeitsplatz(13, xmlData);
        const wartezeitZwoelf = getWartezeitArbeitsplatz(12, xmlData);
        const wartezeitAcht = getWartezeitArbeitsplatz(8, xmlData);
        const wartezeitSiebenDic = getWartezeitArbeitsplatzDetail(7, xmlData);
        const wartezeitNeun = getWartezeitArbeitsplatz(9, xmlData);

        summe+= wartezeitZwoelf + wartezeitDreizehn + wartezeitAcht;

        if (wartezeitSechsDic) {
            for (const index in wartezeitSechsDic) {
                if (wartezeitSechsDic.hasOwnProperty(index)) {
                    if(parseInt(index) == 18 || parseInt(index) == 19 || parseInt(index) == 20){
                        summe += wartezeitSechsDic[index];
                    }
                }
            }
        }

        if (wartezeitSiebenDic) {
            for (const index in wartezeitSiebenDic) {
                if (wartezeitSiebenDic.hasOwnProperty(index)) {
                    if(parseInt(index) == 18 || parseInt(index) == 19 || parseInt(index) == 20 || parseInt(index) == 10 || parseInt(index) == 11 || parseInt(index) == 12 || parseInt(index) == 13 || parseInt(index) == 14 || parseInt(index) == 15){
                        summe += wartezeitSiebenDic[index];
                    }
                }
            }
        }
        summe+=wartezeitNeun;
    }

    const ordersinwork = xmlData.results.ordersinwork.workplace;
    console.log("Oders in work: ", ordersinwork);
    if (ordersinwork) {
        const workplaces = Array.isArray(ordersinwork) ? ordersinwork : [ordersinwork];
        console.log("Workplaces1: ", workplaces);
        for (const workplace of workplaces) {
            console.log("Workplaces1: ", workplaces);
            const idnew = workplace["$"].id;
            const timeneed = workplace["$"].timeneed;
            console.log("Gefundene_ID:", parseInt(idnew))
            console.log("Summe: ", summe);
            console.log("Vergleich1:", parseInt(idnew), typeof idnew, "==", id, typeof id);

            if (parseInt(idnew) == id) {
                console.log("Timeneed1: ", timeneed);
                summe += parseInt(timeneed);
                console.log("Summe1: ", summe);
            }
        }
    }

    return summe;
}


const getWartezeitAlleArbeitsplaetze=(xmlData: any):number[] => {
    const wartezeiten: number[] = [];

    for (let i = 1; i <= 15; i++) {
        wartezeiten.push(getWartezeitArbeitsplatzGesamt(xmlData, i));
    }

    return wartezeiten;
};

export default function JsonViewPage() {
    const { xmlData } = useXmlData();

    const wartezeiten = getWartezeitAlleArbeitsplaetze(xmlData);

    const valueGroups: ProductComponent[][] = [
        backWheelValues,     // Gruppe 1
        frontWheelValues,    // Gruppe 2
        mudguardbackValues,  // Gruppe 3
        mudguardfrontValues, // Gruppe 4
        barValues,           // Gruppe 5
        saddleValues,        // Gruppe 6
        frameValues,         // Gruppe 7
        pedalValues,         // Gruppe 8
        frontwheelcompleteValues, // Gruppe 9
        framewheelsValues,   // Gruppe 10
        bikewithoutpedalsvalues, // Gruppe 11
        bikecompleteValues   // Gruppe 12
    ];

    const ruestzeitold = getRuestzeitOld(xmlData, ...valueGroups);

    if (!xmlData) {
        return <p>Keine Daten gefunden. Bitte lade zuerst deine XML-Datei.</p>;
    }

    const { t} = useTranslation();

    const allProductComponents: ProductComponent[] = [
        ...backWheelValues,
        ...frontWheelValues,
        ...mudguardbackValues,
        ...mudguardfrontValues,
        barValues,
        saddleValues,
        ...frameValues,
        pedalValues,
        ...frontwheelcompleteValues,
        ...framewheelsValues,
        ...bikewithoutpedalsvalues,
        ...bikecompleteValues
    ].flat();

    const setupTimes = calculateSetupTimePerWorkplace(
        backWheelValues,
        frontWheelValues,
        mudguardbackValues,
        mudguardfrontValues,
        barValues,
        saddleValues,
        frameValues,
        pedalValues,
        frontwheelcompleteValues,
        framewheelsValues,
        bikewithoutpedalsvalues,
        bikecompleteValues
    );

    const columnSums = calculateColumnSums(allProductComponents);

    return (
        <div className={styles.pageContainer}>
            <Sidebar />
            <div className={styles.content}>
                <h2 className={styles.sectionTitle}>{t('capacity.title')}</h2>
                <div className={styles.tableContainer}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th></th>
                                <th colSpan={18}>{t('capacity.workstation')}</th>
                            </tr>

                            <tr>
                                <th>{t('capacity.product')}</th>
                                <th>{t('capacity.bikemodell')}</th>
                                <th>{t('capacity.itemnumber')}</th>
                                <th>{t('capacity.orderquantity')}</th>
                                <th>1</th>
                                <th>2</th>
                                <th>3</th>
                                <th>4</th>
                                <th>5</th>
                                <th>6</th>
                                <th>7</th>
                                <th>8</th>
                                <th>9</th>
                                <th>10</th>
                                <th>11</th>
                                <th>12</th>
                                <th>13</th>
                                <th>14</th>
                                <th>15</th>
                            </tr>
                            </thead>
                            <tbody>
                            <ProductTableThree
                                t={t}
                                values={backWheelValues}
                                headerText="capacity.backwheel"
                            />
                            <ProductTableThree
                                t={t}
                                values={frontWheelValues}
                                headerText="capacity.frontwheel"
                            />
                            <ProductTableThree
                                t={t}
                                values={mudguardbackValues}
                                headerText="capacity.mudguardback"
                            />
                            <ProductTableThree
                                t={t}
                                values={mudguardfrontValues}
                                headerText="capacity.mudguardfront"
                            />
                            <ProductTableOne
                                t={t}
                                values={barValues}
                                headerText="capacity.bar"
                            />
                            <ProductTableOne
                                t={t}
                                values={saddleValues}
                                headerText="capacity.saddle"
                            />
                            <ProductTableThree
                                t={t}
                                values={frameValues}
                                headerText="capacity.frame"
                            />
                            <ProductTableOne
                                t={t}
                                values={pedalValues}
                                headerText="capacity.pedal"
                            />
                            <ProductTableThree
                                t={t}
                                values={frontwheelcompleteValues}
                                headerText="capacity.frontwheelcomplete"
                            />
                            <ProductTableThree
                                t={t}
                                values={framewheelsValues}
                                headerText="capacity.framewheels"
                            />
                            <ProductTableThree
                                t={t}
                                values={bikewithoutpedalsvalues}
                                headerText="capacity.bikewithoutpedals"
                            />
                            <ProductTableThree
                                t={t}
                                values={bikecompleteValues}
                                headerText="capacity.bike"
                            />
                            </tbody>
                            <tfoot>
                            <tr className={styles.sumRow}>
                                <td colSpan={4}>{t('capacity.new')}</td>
                                {columnSums.map((sum, index) => (
                                    <td key={`sum-${index}`}>{sum}</td>
                                ))}
                            </tr>
                            <tr className={styles.setupRow}>
                                <td colSpan={4}>{t('capacity.setuptimeNew')}</td>
                                {setupTimes.map((time, index) => (
                                    <td key={index}>{time}</td>
                                ))}
                            </tr>
                            <tr className={styles.setupRow}>
                                <td colSpan={4}>{t('capacity.capacityrequirementOld')}</td>
                                {wartezeiten.map((wartezeit, index) => (
                                    <td key={`wartezeit-${index}`}>{wartezeit}</td> // Jeder Wert als <td>
                                ))}
                            </tr>
                            <tr className={styles.setupRow}>
                                <td colSpan={4}>{t('capacity.setuptimeOld')}</td>
                                {ruestzeitold.map((time, index) => (
                                    <td key={index}>{time}</td>
                                ))}
                            </tr>
                            <tr className={styles.sumRowNew}>
                                <td colSpan={4}>{t('capacity.totalcapacityreq')}</td>
                                <td colSpan={15}></td>
                            </tr>
                            <tr className={styles.setupRow}>
                                <td colSpan={4}>{t('capacity.overtime')}</td>
                                <td colSpan={15}></td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}