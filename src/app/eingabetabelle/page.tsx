'use client';

import React, { useEffect, useState } from 'react';
import initialData from './initialData';
import SortableItem from '@/components/SortableItem';
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import styles from './eingabetabelle.module.css';
import { useTranslation } from 'react-i18next';
import { useXmlData, XmlDataType } from '@/context/XmlDataContext';
import Sidebar from '@/components/Sidebar';

interface SubItem {
    id: string;
    parentId: string;
    value: number;
    workstations: string;
    product: string;
}

interface Heading {
    id: string;
    title: string;
    workstations: string;
    product: string;
    subItems: SubItem[];
}

type WarteschlangeDict = {
    [key: string]: {
        anzahl: string;
        inwork: boolean;
    };
};

const getWarteschlange = (xmlData: any): WarteschlangeDict | null => {
    if (
        !xmlData?.results?.waitinglistworkstations?.workplace ||
        !xmlData?.results?.ordersinwork?.workplace
    ) {
        return null;
    }

    const warteschlange: WarteschlangeDict = {};

    const inWorkItems = new Set<string>();
    const ordersInWork = Array.isArray(xmlData.results.ordersinwork.workplace)
        ? xmlData.results.ordersinwork.workplace
        : [xmlData.results.ordersinwork.workplace];

    ordersInWork.forEach((wp: any) => {
        const item = wp?.$?.item;
        if (item) {
            inWorkItems.add(item);
        }
    });

    const workplaces = Array.isArray(xmlData.results.waitinglistworkstations.workplace)
        ? xmlData.results.waitinglistworkstations.workplace
        : [xmlData.results.waitinglistworkstations.workplace];

    workplaces.forEach((wp: any) => {
        const waitingLists = wp.waitinglist;
        if (waitingLists) {
            const waitingArray = Array.isArray(waitingLists) ? waitingLists : [waitingLists];
            waitingArray.forEach((wl: any) => {
                const item = wl?.$?.item;
                const amount = wl?.$?.amount;
                if (item && amount) {
                    const keyPrefix = ['1', '2', '3'].includes(item) ? 'P' : 'E';
                    const formattedKey = `${keyPrefix}${item}`;
                    warteschlange[formattedKey] = {
                        anzahl: amount,
                        inwork: inWorkItems.has(item),
                    };
                }
            });
        }
    });

    return warteschlange;
};

export default function Inputtable() {

    const [headings, setHeadings] = useState<Heading[]>(() => {
        const savedHeadings = localStorage.getItem('inputtable_headings');
        if (savedHeadings) {
            try {
                return JSON.parse(savedHeadings);
            } catch (error) {
                console.error('Error parsing headings from localStorage:', error);
            }
        }
        return initialData;
    });

    const [sortedIds, setSortedIds] = useState<string[]>(() => {
        const savedSortedIds = localStorage.getItem('inputtable_sortedIds');
        if (savedSortedIds) {
            try {
                return JSON.parse(savedSortedIds);
            } catch (error) {
                console.error('Error parsing sortedIds from localStorage:', error);
            }
        }
        return initialData.flatMap((heading: Heading) => heading.subItems.map((item: SubItem) => item.id)); // Wenn keine gespeicherten Daten vorhanden sind
    });

    const { xmlData, setXmlData } = useXmlData();
    const totals = xmlData?.internaldata?.totals || {};

    const warteschlange = getWarteschlange(xmlData);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    const { t } = useTranslation();

    const getHeadingValueFromTotals = (title: string): number => {
        const key = title.replace(/^[EP]/, '');
        return totals[key] ?? 0;
    };

    useEffect(() => {
        setHeadings((prev) =>
            prev.map((heading) => {
                if (heading.subItems.length === 0) return heading;

                const sumOtherItems = heading.subItems.slice(1).reduce(
                    (sum: number, item: SubItem) => sum + item.value,
                    0
                );

                const newFirstItemValue = getHeadingValueFromTotals(heading.title) - sumOtherItems;

                if (heading.subItems[0].value === newFirstItemValue) return heading;

                const firstSubItem = heading.subItems[0] || { workstations: 'unbekannt', id: '', parentId: '', value: 0 };

                return {
                    ...heading,
                    subItems: [
                        {
                            ...firstSubItem,
                            value: newFirstItemValue,
                            workstations: firstSubItem.workstations ?? 'unbekannt',
                        },
                        ...heading.subItems.slice(1),
                    ],
                };
            })
        );
    }, [headings.map((h) => h.subItems.map((s) => s.value).join(',')).join('|'), totals]);


    useEffect(() => {
        if (!xmlData) return;

        const inputtableData = sortedIds
            .map((id: string) => {
                const item = headings.flatMap((h) => h.subItems).find((i) => i.id === id);
                if (!item) return null;
                const heading = headings.find((h) => h.id === item.parentId);
                if (!heading) return null;

                return {
                    key: heading.title.replace(/^[EP]/, ''),
                    value: item.value,
                };
            })
            .filter(Boolean) as { key: string; value: number }[];

        setXmlData((prev: XmlDataType) => ({
            ...prev,
            internaldata: {
                ...prev.internaldata,
                inputtable: inputtableData,
            },
        }));
    }, [headings, sortedIds]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;
        const oldIndex = sortedIds.indexOf(active.id as string);
        const newIndex = sortedIds.indexOf(over.id as string);
        setSortedIds((prev) => arrayMove(prev, oldIndex, newIndex));
    };

    const addNewItem = (headingId: string) => {
        const heading = headings.find((h) => h.id === headingId);
        if (!heading) return;

        const baseWorkstations = heading.subItems[0]?.workstations || '';

        const newItemId = `item-${headingId.split('-')[1]}-${crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 10)}`;
        const newItem: SubItem = {
            id: newItemId,
            parentId: headingId,
            value: 0,
            workstations: baseWorkstations,
            product: heading.product,
        };

        setHeadings((prev) =>
            prev.map((h) =>
                h.id === headingId ? { ...h, subItems: [...h.subItems, newItem] } : h
            )
        );

        setSortedIds((prev) => {
            const lastSubItem = heading.subItems[heading.subItems.length - 1];
            const lastIndex = prev.findIndex((id) => id === lastSubItem.id);
            const newSortedIds = [...prev];
            newSortedIds.splice(lastIndex + 1, 0, newItemId);
            return newSortedIds;
        });
    };

    const deleteItem = (itemId: string) => {
        setHeadings((prev) =>
            prev.map((heading) => {
                const itemIndex = heading.subItems.findIndex((item) => item.id === itemId);
                if (itemIndex === -1) return heading;
                if (itemIndex > 0) {
                    return { ...heading, subItems: heading.subItems.filter((item) => item.id !== itemId) };
                }
                if (heading.subItems.length > 1) {
                    return {
                        ...heading,
                        subItems: [
                            { ...heading.subItems[0], value: getHeadingValueFromTotals(heading.title) },
                            ...heading.subItems.slice(2),
                        ],
                    };
                }
                return { ...heading, subItems: [{ ...heading.subItems[0], value: getHeadingValueFromTotals(heading.title) }] };
            })
        );
        setSortedIds((prev) => prev.filter((id) => id !== itemId));
    };

    const updateSubItemValue = (itemId: string, newValue: number) => {
        setHeadings((prev) =>
            prev.map((heading) => {
                const itemIndex = heading.subItems.findIndex((item) => item.id === itemId);
                if (itemIndex === -1) return heading;
                newValue = Math.max(0, newValue);
                if (itemIndex === 0) return heading;
                const total = getHeadingValueFromTotals(heading.title);
                const sumOtherEditableItems = heading.subItems
                    .filter((item, index) => item.id !== itemId && index > 0)
                    .reduce((sum: number, item: SubItem) => sum + item.value, 0);
                const maxPossibleValue = total - sumOtherEditableItems - 10;
                const adjustedValue = Math.min(newValue, Math.max(0, maxPossibleValue));
                const newFirstItemValue = total - sumOtherEditableItems - adjustedValue;
                return {
                    ...heading,
                    subItems: heading.subItems.map((item, index) => {
                        if (index === 0) return { ...item, value: newFirstItemValue };
                        if (item.id === itemId) return { ...item, value: adjustedValue };
                        return item;
                    }),
                };
            })
        );
    };

    useEffect(() => {
        if (headings) {
            localStorage.setItem('inputtable_headings', JSON.stringify(headings));
        }
    }, [headings]);

    useEffect(() => {
        if (sortedIds) {
            localStorage.setItem('inputtable_sortedIds', JSON.stringify(sortedIds));
        }
    }, [sortedIds]);

    const getArticleValueById = (id: string): number => {
        if (!xmlData?.results.warehousestock?.article) return 0;
        const article = xmlData.results.warehousestock.article.find((a: any) => a?.$?.id === id);
        return article ? parseInt(article.$.amount) || 0 : 0;
    };

    const checkCondition = (id1: string, id2: string, id3: string, id4: string,) => {
        const e1Value = getHeadingValueFromTotals(id1);
        let e2Value = getArticleValueById(id2);
        let e3Value = getArticleValueById(id3);
        let e4Value = getArticleValueById(id4);
        if(id2 === '16' || id2 === '17' || id2 === '26') {
            e2Value = e2Value/3;
        }
        if(id3 === '16' || id3 === '17' || id3 === '26') {
            e3Value = e3Value/3;
        }
        if(id4 === '16' || id4 === '17' || id4 === '26') {
            e3Value = e3Value/3;
        }
        return e2Value >= e1Value && e3Value >= e1Value && e4Value >= e1Value;
    };

    const checkCondition2 = (id1: string, id2: string, id3: string) => {
        const e1Value = getHeadingValueFromTotals(id1);
        let e2Value = getArticleValueById(id2);
        let e3Value = getArticleValueById(id3);
        if(id2 === '16' || id2 === '17' || id2 === '26') {
            e2Value = e2Value/3;
        }
        if(id3 === '16' || id3 === '17' || id3 === '26') {
            e3Value = e3Value/3;
        }
        return e2Value >= e1Value && e3Value >= e1Value;
    };

    return (
        <div className={styles.pageContainer}>
            <Sidebar />
            <h2 className={styles.sectionTitle}>{t('inputtable.inputtable')}</h2>
            <div className={styles.mainContent}>
                <div className={styles.itemList}>
                    {headings.map((heading) => (
                        <div key={heading.id} className={styles.headingSection}>
                            <div className={styles.headingRow}>
                                <span className={styles.headingLabel}>
                                    {heading.title}
                                    {((heading.title === 'E49' && checkCondition('E49', '13', '18', '7')) ||
                                        (heading.title === 'E54' && checkCondition('E54', '14', '19', '8')) ||
                                        (heading.title === 'E50' && checkCondition('E50', '49', '4', '10')) ||
                                        (heading.title === 'E55' && checkCondition('E55', '54', '5', '11')) ||
                                        (heading.title === 'E30' && checkCondition('E30', '29', '6', '12')) ||
                                        (heading.title === 'E56' && checkCondition('E56', '17', '16', '55')) ||
                                        (heading.title === 'E51' && checkCondition('E51', '17', '16', '50')) ||
                                        (heading.title === 'E31' && checkCondition('E31', '17', '16', '30')) ||
                                        (heading.title === 'P1' && checkCondition2('P1', '51', '26')) ||
                                        (heading.title === 'P2' && checkCondition2('P2', '56', '26')) ||
                                        (heading.title === 'P3' && checkCondition2('P3', '31', '26')) ||
                                        (heading.title === 'E29' && checkCondition('E29', '15', '20', '9'))) && (
                                            <>
                                                {' '}
                                                <span className={styles.successMessage}>
                                                    {t('inputtable.productionMessage')}
                                                </span>
                                            </>
                                        )}
                                </span>
                                <input
                                    type="number"
                                    className={styles.headingValueInput}
                                    value={getHeadingValueFromTotals(heading.title)}
                                    disabled
                                />
                            </div>
                            {heading.subItems.map((item, index) => (
                                <div key={item.id} className={styles.itemRow}>
                                    <input
                                        className={styles.numberInput}
                                        type="number"
                                        value={item.value}
                                        onChange={(e) => updateSubItemValue(item.id, Math.max(0, Number(e.target.value)))}
                                        disabled={index === 0}
                                        step={"10"}
                                    />
                                    {index > 0 && (
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => deleteItem(item.id)}
                                            title="Zeile löschen"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button className={styles.addButton} onClick={() => addNewItem(heading.id)}>
                                {t('inputtable.split')}
                            </button>
                        </div>
                    ))}
                </div>
                <div className={styles.dropZoneContainer}>
                    {warteschlange && (
                        <div className={styles.warteschlangeStatus}>
                            <h5>{t('inputtable.waitinglist')}</h5>
                            <div className={styles.warteschlangeItems}>
                                {Object.entries(warteschlange).map(([itemId, info]) => (
                                    <div
                                        key={itemId}
                                        className={`${styles.warteschlangeItem} ${info.inwork ? styles.inWork : styles.waiting}`}
                                    >
                                        {itemId}: {info.anzahl}{' '}
                                        {info.inwork
                                            ? t('inputtable.waitinglistmessageInWork')
                                            : t('inputtable.waitinglistmessageWait')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
                        <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
                            <div className={styles.dropZone}>
                                {sortedIds.map((id) => {
                                    console.log("A", sortedIds);
                                    console.log("B", headings);
                                    const item = headings.flatMap((h) => h.subItems).find((i) => i.id === id);
                                    console.log(item);
                                    console.log(item?.workstations);
                                    return item ? (
                                        <SortableItem
                                            id={item.id}
                                            key={item.id}
                                            className={`${styles.draggableButton} ${styles[`productColor-${item.product}`] || styles['productColor-default']}`}
                                        >
                                            <div>
                                                <div>
                                                    {headings.find((h) => h.id === item.parentId)?.title} ({item.value})
                                                </div>
                                                <div>{item.workstations}</div>
                                                <div>
                                                    {item.product === "4" ? 'P1/P2/P3' : `P${item.product}`}
                                                </div>
                                            </div>
                                        </SortableItem>

                                    ) : null;
                                })}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>
        </div>
    );
}
