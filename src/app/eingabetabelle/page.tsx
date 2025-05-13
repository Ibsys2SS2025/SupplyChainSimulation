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

// Typisierung der Daten
interface SubItem {
    id: string;
    parentId: string;
    value: number;
}

interface Heading {
    id: string;
    title: string;
    subItems: SubItem[];
}

export default function App() {
    // Laden von `headings` und `sortedIds` aus dem localStorage, falls vorhanden
    const [headings, setHeadings] = useState<Heading[]>(() => {
        const savedHeadings = localStorage.getItem('inputtable_headings');
        if (savedHeadings) {
            try {
                return JSON.parse(savedHeadings);
            } catch (error) {
                console.error('Error parsing headings from localStorage:', error);
            }
        }
        return initialData; // Wenn keine gespeicherten Daten vorhanden sind, benutze initialData
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
                const sumOtherItems = heading.subItems.slice(1).reduce((sum: number, item: SubItem) => sum + item.value, 0);
                const newFirstItemValue = getHeadingValueFromTotals(heading.title) - sumOtherItems;
                if (heading.subItems[0].value === newFirstItemValue) return heading;
                return {
                    ...heading,
                    subItems: [
                        { ...heading.subItems[0], value: newFirstItemValue },
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
        const newItemId = `item-${headingId.split('-')[1]}-${crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 10)}`;
        const newItem = { id: newItemId, parentId: headingId, value: 0 };
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

    // Speichern der Daten in localStorage, wenn sich der Zustand ändert
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

    return (
        <div className={styles.pageContainer}>
            <Sidebar />
            <h2 className={styles.sectionTitle}>{t('inputtable.inputtable')}</h2>
            <div className={styles.mainContent}>
                <div className={styles.itemList}>
                    {headings.map((heading) => (
                        <div key={heading.id} className={styles.headingSection}>
                            <div className={styles.headingRow}>
                                <span className={styles.headingLabel}>{heading.title}</span>
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
                    <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
                        <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
                            <div className={styles.dropZone}>
                                {sortedIds.map((id) => {
                                    const item = headings.flatMap((h) => h.subItems).find((i) => i.id === id);
                                    return item ? (
                                        <SortableItem key={item.id} id={item.id}>
                                            <div className={styles.draggableButton}>
                                                {headings.find((h) => h.id === item.parentId)?.title} ({item.value})
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
