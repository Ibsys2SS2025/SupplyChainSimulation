'use client';

import React, {useEffect, useState} from 'react';
import {useXmlData, XmlDataType} from '@/context/XmlDataContext';
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

type WaitinglistEntry = {
    $: {
        period: string;
        order: string;
        firstbatch: string;
        lastbatch: string;
        item: string;
        [key: string]: string; // falls noch mehr Properties vorkommen
    };
};

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
            if (item.value > 0) {
                item.setuptime.forEach((value, index) => {
                    const numericValue = typeof value === "string" ? parseFloat(value) : value;
                    if (!isNaN(numericValue)) {
                        result[index] += numericValue;
                    }
                });
            }
        }
    }

    return result;
}

const getWartezeitArbeitsplatz = (id: number, xmlData: any): number => {
    if (!xmlData || !xmlData.results || !xmlData.results.waitinglistworkstations) {
        return 0;
    }
    let totalTimeneed = 0;

    const waitingList = xmlData?.results?.waitinglistworkstations?.workplace;
    if (waitingList) {
        const workplaces = Array.isArray(waitingList) ? waitingList : [waitingList];
        for (const workplace of workplaces) {
            const details = workplace["$"];
            if (details && parseInt(details.id, 10) === id) {
                totalTimeneed += parseInt(details.timeneed, 10) || 0;
            }
        }
    }

    const inWorkList = xmlData?.results?.ordersinwork?.workplace;
    if (inWorkList) {
        const workplaces = Array.isArray(inWorkList) ? inWorkList : [inWorkList];
        for (const workplace of workplaces) {
            const details = workplace["$"];
            if (details && parseInt(details.id, 10) === id) {
                totalTimeneed += parseInt(details.timeneed, 10) || 0;
            }
        }
    }

    return totalTimeneed;
};


const getWartezeitArbeitsplatzDetail = (id: number, xmlData: any): { [key: number]: number } => {
    if (!xmlData || !xmlData.results || !xmlData.results.waitinglistworkstations) {
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

const getRuestzeitOld = (xmlData: any, ...valueGroups: ProductComponent[][]): number[] => {
    const ruestzeit: number[] = [];
    let summe = 0;
    // Hole alle IDs aus ordersinwork
    const ordersInWork = xmlData?.results?.ordersinwork?.workplace;
    const ordersInWorkList = Array.isArray(ordersInWork) ? ordersInWork : [ordersInWork].filter(Boolean);
    const activeOrderIds = new Set<number>();
    const orderIdMap: { [key: string]: string } = {}; // Dictionary mit id als Key, item als Value

    for (const w of ordersInWorkList) {
        const id = parseInt(w["$"]?.item, 10);
        if (!isNaN(id)) {
            activeOrderIds.add(id);
            const key = w["$"]?.id;
            const value = w["$"]?.item;
            if (key && value) {
                orderIdMap[key] = value;
            }
        }
    }

    const waitingListWorkplaces = xmlData?.results?.waitinglistworkstations?.workplace;

    for (let i = 1; i <= 15; i++) {
        console.log("Arbeitsplatz: ", i);
        if (i === 5) {
            ruestzeit[i-1] = 0;
            continue;
        }
        const key = String(i);

        if (orderIdMap && Object.prototype.hasOwnProperty.call(orderIdMap, key)) {

            const productId = orderIdMap[key];
            const workplace = waitingListWorkplaces.find(
                (w: { $?: { id: string } }) => w.$?.id === key
            );

            console.log(workplace);

            if (!workplace || !workplace.waitinglist) {
                continue;
            }

            const waitingListArray = Array.isArray(workplace.waitinglist)
                ? workplace.waitinglist
                : [workplace.waitinglist];

            const otherItems = waitingListArray.filter(
                (entry: any) => entry?.$?.item !== productId
            );

            if (otherItems.length > 0) {
                otherItems.forEach((item: WaitinglistEntry) => {
                    const product = valueGroups
                        .flat()
                        .find(p => p.code === item.$.item);
                    summe += Number(product?.setuptime?.[i - 1] ?? 0);
                });

            } else {
            }
        } else {
            const workplace = waitingListWorkplaces.find(
                (w: { $?: { id: string } }) => w.$?.id === key
            );
            if (!(workplace?.['$']?.timeneed == 0)) {
                const itemNumbers: number[] = workplace.waitinglist.map(
                    (entry: { $: { item: string } }) => Number(entry.$.item)
                );

                itemNumbers.forEach(itemNumber => {
                    const product = valueGroups
                        .flat()
                        .find(p => Number(p.code) === itemNumber);
                    summe += Number(product?.setuptime?.[i - 1] ?? 0);
                });
            }
        }
        ruestzeit[i-1] = summe;
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
        const wartezeitAcht = getWartezeitArbeitsplatz(8, xmlData);

        summe+=wartezeitAcht;
    }

    if(id == 7){
        const wartezeitSiebenDic = getWartezeitArbeitsplatzDetail(7, xmlData);

        if (wartezeitSiebenDic) {
            for (const index in wartezeitSiebenDic) {
                if (wartezeitSiebenDic.hasOwnProperty(index)) {
                    if(parseInt(index) == 18 || parseInt(index) == 19 || parseInt(index) == 20 || parseInt(index) == 10 || parseInt(index) == 11 || parseInt(index) == 12 || parseInt(index) == 13 || parseInt(index) == 14 || parseInt(index) == 15 || parseInt(index) == 26){
                        summe += wartezeitSiebenDic[index];
                    }
                }
            }
        }
    }

    if(id == 9){
        const wartezeitNeun = getWartezeitArbeitsplatz(9, xmlData);

        summe+=wartezeitNeun;
    }

    /**const ordersinwork = xmlData.results.ordersinwork.workplace;
     if (ordersinwork) {
     const workplaces = Array.isArray(ordersinwork) ? ordersinwork : [ordersinwork];
     for (const workplace of workplaces) {
     const idnew = workplace["$"].id;
     const timeneed = workplace["$"].timeneed;

     if (parseInt(idnew) == id) {
     summe += parseInt(timeneed);
     }
     }
     }**/

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

export default function Kapazitaetsplanung() {
    const { xmlData, setXmlData } = useXmlData();

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

    const allGroups = [
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

    const enrichedGroups = allGroups.map(group => useEnrichedProductComponents(group, xmlData));

    const setupTimes = calculateSetupTimePerWorkplace(...enrichedGroups);


    const [customInputs] = useState(Array(15).fill(''));

    const enrichedComponents = useEnrichedProductComponents(allProductComponents, xmlData);

    const columnSums = calculateColumnSums(enrichedComponents);

    const [customInputsSetUp, setCustomInputsSetUp] = useState<string[]>([]);

    const [customInputsOvertime, setCustomInputsOvertime] = useState(Array(15).fill(0));

    useEffect(() => {
        if (setupTimes.length > 0 && customInputsSetUp.length === 0) {
            setCustomInputsSetUp(setupTimes.map(time => time.toString()));
        }
    }, [setupTimes.length, customInputsSetUp.length]);

    const numericCustomInputs = customInputsSetUp.map((val) => Number(val) || 0); // Fallback zu 0 bei NaN
    const totalCapacities = calculateTotalCapacity(columnSums, numericCustomInputs, wartezeiten, ruestzeitold);

    const overtimeValues = calculateOvertime(totalCapacities);

    const [dropdownValues, setDropdownValues] = useState(
        overtimeValues.map((value) => {
            if (value > 960) return "3";
            if (value > 480) return "2";
            return "1";
        })
    );

    useEffect(() => {
        if (!xmlData) return;

        const capacityData: Record<string, { input: number, shift: number }> = {};

        customInputs.forEach((value, index) => {
            capacityData[(index + 1).toString()] = {
                input: Number(value),
                shift: Number(dropdownValues[index] ?? '1'),
            };
        });

        setXmlData((prev: XmlDataType) => ({
            ...prev,
            internaldata: {
                ...prev.internaldata,
                capacity: capacityData
            }
        }));
    }, [customInputs, dropdownValues]);

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
                                <td colSpan={4}>{t('capacity.steuptimevariable')}</td>
                                {customInputsSetUp.map((value, index) => (
                                    <td key={`input-${index}`}>
                                        <input
                                            type="number"
                                            className={styles.inputCell}
                                            value={value}
                                            onChange={(e) => {
                                                const newValues = [...customInputsSetUp];
                                                newValues[index] = e.target.value;
                                                setCustomInputsSetUp(newValues);
                                            }}
                                            name={`customInput-${index}`}
                                        />
                                    </td>
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
                                {customInputsOvertime.map((value, index) => (
                                    <td key={`input-${index}`}>
                                        <input
                                            type="number"
                                            className={styles.inputCell}
                                            value={value}
                                            onChange={(e) => {
                                                const newValues = [...customInputsOvertime];
                                                newValues[index] = e.target.value;
                                                setCustomInputsOvertime(newValues);
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