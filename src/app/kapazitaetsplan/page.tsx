'use client';

import React, {useState} from 'react';
import {useXmlData} from '@/context/XmlDataContext';
import styles from "@/app/kapazitaetsplan/table.module.css";
import Sidebar from "@/components/Sidebar";
import {useTranslation} from "react-i18next";
import ProductTableThree from './tablerowThree';
import ProductTableOne from "@/app/kapazitaetsplan/tablerowOne";
import {
    backWheelValues,
    barValues,
    bikecompleteValues,
    bikewithoutpedalsvalues,
    frameValues,
    framewheelsValues,
    frontwheelcompleteValues,
    frontWheelValues,
    mudguardbackValues,
    mudguardfrontValues,
    pedalValues,
    saddleValues
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

    const workplaces = xmlData.results.waitinglistworkstations.workplace;

    if (!workplaces || workplaces.length === 0) {
        return 0;
    }

    const workplaceList = Array.isArray(workplaces) ? workplaces : [workplaces];

    for (const workplace of workplaceList) {
        const workplaceDetails = workplace["$"];
        if (workplaceDetails) {
            const workplaceId = parseInt(workplaceDetails.id, 10); // ID als Zahl
            const timeneed = parseInt(workplaceDetails.timeneed, 10); // timeneed als Zahl

            if (workplaceId === id) {
                return timeneed || 0; // Rückgabe von timeneed, oder 0, falls nicht vorhanden
            }
        }
    }

    return 0;
};

const getWartezeitArbeitsplatzDetail = (id: number, xmlData: any): { [key: number]: number } => {
    if (!xmlData || !xmlData.results || !xmlData.results.waitinglistworkstations) {
        console.log("xmlData oder waitinglistworkstations fehlt");
        return {};
    }

    const workplaces = xmlData.results.waitinglistworkstations.workplace;

    if (!workplaces || workplaces.length === 0) {
        return {};
    }

    const workplaceList = Array.isArray(workplaces) ? workplaces : [workplaces];

    const dic: { [key: number]: number } = {};

    for (const workplace of workplaceList) {
        const workplaceId = parseInt(workplace["$"].id);

        console.log("Vergleich ID:", workplaceId, "mit gesuchter ID:", id);

        if (workplaceId === id) {

            const workplaceDetailWaitingList = workplace.waitinglist;

            if (workplaceDetailWaitingList) {

                if (Array.isArray(workplaceDetailWaitingList)) {
                    for (const workplaceDetail of workplaceDetailWaitingList) {

                        const item = workplaceDetail["$"].item;
                        const timeneed = workplaceDetail["$"].timeneed;

                        dic[parseInt(item)] = parseInt(timeneed);
                    }
                } else if (workplaceDetailWaitingList) {
                    const item = workplaceDetailWaitingList["$"].item;
                    const timeneed = workplaceDetailWaitingList["$"].timeneed;
                    dic[parseInt(item)] = parseInt(timeneed);
                }
            }
        }
    }
    return dic;
};

const getRuestzeitOld=(xmlData: any, ...valueGroups: ProductComponent[][]):number[] => {
    const ruestzeit: number[] = [];
    let summe: number = 0;
    for (let i = 1; i < 16; i++) {
        const dic = getWartezeitArbeitsplatzDetail(i, xmlData);
        Object.entries(dic).forEach(([key]) => {
            for (const group of valueGroups) {
                for (const item of group) {
                    if(item.code == key){
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
    if (ordersinwork) {
        const workplaces = Array.isArray(ordersinwork) ? ordersinwork : [ordersinwork];
        for (const workplace of workplaces) {
            const idnew = workplace["$"].id;
            const timeneed = workplace["$"].timeneed;

            if (parseInt(idnew) == id) {
                summe += parseInt(timeneed);
            }
        }
    }

    return summe;
}

const calculateTotalCapacity = (
    columnSums: number[],
    setupTimes: number[],
    wartezeiten: number[],
    ruestzeitold: number[]
): number[] => {
    return columnSums.map((_, index) => {
        return (
            (columnSums[index] || 0) +
            (setupTimes[index] || 0) +
            (wartezeiten[index] || 0) +
            (ruestzeitold[index] || 0)
        );
    });
};

const useEnrichedProductComponents = (productComponents: ProductComponent[], xmlData: any) => {

    const totals = xmlData?.internaldata?.totals || {};

    return productComponents.map((item) => {
        const codeNumber = Number(item.code);
        const newValue = totals[codeNumber];
        return {
            ...item,
            value: typeof newValue === 'number' ? newValue : item.value,
        };
    });
};

const calculateOvertime = (totals: number[]): number[] => {
    return totals.map((total) => Math.max(0, (total - 2400) / 5));
};



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

    const [customInputs, setCustomInputs] = useState(Array(15).fill(''));

    const enrichedComponents = useEnrichedProductComponents(allProductComponents, xmlData);

    const columnSums = calculateColumnSums(enrichedComponents);

    const totalCapacities = calculateTotalCapacity(columnSums, setupTimes, wartezeiten, ruestzeitold);
    const overtimeValues = calculateOvertime(totalCapacities);

    const [dropdownValues, setDropdownValues] = useState(
        overtimeValues.map((value) => {
            if (value > 960) return "3";
            if (value > 480) return "2";
            return "1";
        })
    );

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
                            <tr className={styles.sumRow}>
                                <td colSpan={4}>{t('capacity.totalcapacityreq')}</td>
                                {totalCapacities.map((total, index) => (
                                    <td key={`total-${index}`}>{total}</td>
                                ))}
                            </tr>
                            <tr className={styles.setupRow}>
                                <td colSpan={4}>{t('capacity.overtime')}</td>
                                {overtimeValues.map((value, index) => (
                                    <td key={`overtime-${index}`}>{value}</td>
                                ))}
                            </tr>
                            <tr className={styles.setupRow}>
                                <td colSpan={4}>{t('capacity.customInputs')}</td>
                                {customInputs.map((value, index) => (
                                    <td key={`input-${index}`}>
                                        <input
                                            type="number"
                                            className={styles.inputCell}
                                            value={value}
                                            onChange={(e) => {
                                                const newValues = [...customInputs];
                                                newValues[index] = e.target.value;
                                                setCustomInputs(newValues);
                                            }}
                                            name={`customInput-${index}`}
                                        />
                                    </td>
                                ))}
                            </tr>
                            <tr className={styles.setupRow}>
                                <td colSpan={4}>{t('capacity.shiftCount')}</td>
                                {customInputs.map((_, index) => (
                                    <td key={`dropdown-${index}`}>
                                        <select
                                            className={styles.inputCell}
                                            value={dropdownValues[index] || '1'}
                                            onChange={(e) => {
                                                const newDropdowns = [...dropdownValues];
                                                newDropdowns[index] = e.target.value as "1" | "2" | "3";
                                                setDropdownValues(newDropdowns);
                                            }}
                                            name={`dropdown-${index}`}
                                        >
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                        </select>
                                    </td>
                                ))}
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}