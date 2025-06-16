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
        [key: string]: string;
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

    const missingPartsList = xmlData?.results?.waitingliststock?.missingpart;
    if (missingPartsList) {
        const missingParts = Array.isArray(missingPartsList) ? missingPartsList : [missingPartsList];
        for (const part of missingParts) {
            const partDetails = part["$"];
            const workplaceDetails = part.workplace?.["$"];
            if (partDetails && parseInt(workplaceDetails.id, 10) === id && workplaceDetails) {
                totalTimeneed += parseInt(workplaceDetails.timeneed, 10) || 0;
            }
        }
    }
    return totalTimeneed;
};

const getRuestzeitOld = (xmlData: any, ...valueGroups: ProductComponent[][]): number[] => {
    const ruestzeit: number[] = [];
    let summe = 0;

    const ordersInWork = xmlData?.results?.ordersinwork?.workplace;
    const ordersInWorkList = Array.isArray(ordersInWork) ? ordersInWork : [ordersInWork].filter(Boolean);
    const activeOrderIds = new Set<number>();
    const orderIdMap: { [key: string]: string } = {};

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
    const missingPartsList = xmlData?.results?.waitingliststock?.missingpart;

    for (let i = 1; i <= 15; i++) {
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
            if (waitingListWorkplaces && missingPartsList) {
                const workplace = waitingListWorkplaces.find(
                    (w: { $?: { id: string } }) => w.$?.id === key
                );
                const workplaceMissingPart = missingPartsList.find(
                    (w: { workplace?: { $?: { id: string } } }) =>
                        w.workplace?.$?.id === key
                );
                const timeneed = workplace?.['$']?.timeneed;
                if (timeneed && Number(timeneed) > 0) {
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

                const missingPartTimeneed = workplaceMissingPart?.workplace?.["$"]?.timeneed;
                if (missingPartTimeneed && Number(missingPartTimeneed) > 0) {
                    let itemNumbers: number[] = [];

                    const waitinglistData = workplaceMissingPart?.workplace?.waitinglist;

                    if (Array.isArray(waitinglistData)) {
                        itemNumbers = waitinglistData.map(
                            (entry: { $: { item: string } }) => Number(entry.$.item)
                        );
                    } else if (waitinglistData?.$?.item) {
                        itemNumbers = [Number(waitinglistData.$.item)];
                    }

                    itemNumbers.forEach(itemNumber => {
                        const product = valueGroups
                            .flat()
                            .find(p => Number(p.code) === itemNumber);
                        summe += Number(product?.setuptime?.[i - 1] ?? 0);
                    });
                }
            }
        }
            ruestzeit[i-1] = summe;
        summe = 0;
    }
    return ruestzeit;
}

const getWartezeitArbeitsplatzGesamt=(xmlData: any, id: number):number => {
    let summe: number = 0;

    summe += getWartezeitArbeitsplatz(id, xmlData);

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

    const numericCustomInputs = customInputsSetUp.map((val) => Number(val) || 0);
    const totalCapacities = calculateTotalCapacity(columnSums, numericCustomInputs, wartezeiten, ruestzeitold);

    const overtimeValues = calculateOvertime(totalCapacities);

    const [dropdownValues, setDropdownValues] = useState<string[]>([]);

    const calculateOvertimeSettings = () => {
        const newDropdowns: string[] = [];

        const newCustomInputs: number[] = [];

        overtimeValues.forEach((value, index) => {
            if (value >= 0 && value <= 240) {
                newDropdowns[index] = "1";
                newCustomInputs[index] = Math.ceil(value);
            } else if (value <= 480 && value > 240) {
                newDropdowns[index] = "2";
                newCustomInputs[index] = 0;
            } else if (value > 480 && value <= 720) {
                newDropdowns[index] = "2";
                newCustomInputs[index] = Math.ceil((value * 5 - 2400) / 5);
            } else if (value > 960) {
                newDropdowns[index] = "3";
                newCustomInputs[index] = 0;
            } else if (value > 720) {
                newDropdowns[index] = "3";
                newCustomInputs[index] = 0;
            }
        });
        setDropdownValues(newDropdowns);
        setCustomInputsOvertime(newCustomInputs);
    };

    useEffect(() => {
        const capacityData: Record<string, { input: number; shift: number }> = {};

        customInputsOvertime.forEach((value, index) => {
            capacityData[(index + 1).toString()] = {
                input: Number(value),
                shift: Number(dropdownValues[index] ?? '1'),
            };
        });

        setXmlData((prev: XmlDataType) => {
            const prevCapacity = prev.internaldata?.capacity;
            const isSame = JSON.stringify(prevCapacity) === JSON.stringify(capacityData);
            if (isSame) return prev;

            return {
                ...prev,
                internaldata: {
                    ...prev.internaldata,
                    capacity: capacityData,
                },
            };
        });
    }, [JSON.stringify(customInputsOvertime), JSON.stringify(dropdownValues)]);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.content}>
                <h2 className={styles.sectionTitle}>{t('capacity.title')}</h2>
                <Sidebar />
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
                                    <td key={`input-${index}`}>
                                        <input
                                            type="number"
                                            className={styles.inputCell}
                                            value={customInputsSetUp[index] ?? ''}
                                            placeholder={time.toString()}
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
                                    <td key={`wartezeit-${index}`}>{wartezeit}</td>
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
                                    <td key={`total-${index}`}>
                                        {total}
                                        {total > 7200 && (
                                            <span className={styles.redExclamation}>
                                             ⚠
                                            </span>
                                        )}

                                    </td>
                                ))}
                            </tr>
                            <tr className={styles.setupRow}>
                                <td colSpan={4}>{t('capacity.customInputs')}
                                    <button
                                    onClick={calculateOvertimeSettings}
                                    className={styles.applyButton}
                                    style={{ marginLeft: '1rem' }}
                                    >
                                    {t('capacity.apply')}
                                </button></td>
                                {customInputsOvertime.map((value, index) => (
                                    <td key={`input-${index}`}>
                                        <input
                                            type="number"
                                            className={`${styles.inputCell}`}
                                            value={value}
                                            onChange={(e) => {
                                                const newValues = [...customInputsOvertime];
                                                newValues[index] = Number(e.target.value);
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
                        {totalCapacities.some(total => total > 7200) && (
                            <div className={styles.legend}>
                                {t('capacity.warning')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}