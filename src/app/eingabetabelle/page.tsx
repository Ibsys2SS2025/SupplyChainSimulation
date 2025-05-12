'use client';

import React, { useState, useEffect } from 'react';
import initialData from './initialData';
import SortableItem from '@/components/SortableItem';
import {
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import styles from './eingabetabelle.module.css';
import { useTranslation } from "react-i18next";
import { useXmlData } from "@/context/XmlDataContext";
import Sidebar from "@/components/Sidebar";

export default function App() {

    const [headings, setHeadings] = useState(initialData);
    const [sortedIds, setSortedIds] = useState(
        initialData.flatMap(heading => heading.subItems.map(item => item.id))
    );

    const { xmlData } = useXmlData();
    const totals = xmlData?.internaldata?.totals || {};

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    const { t } = useTranslation();

    const getHeadingValueFromTotals = (title: string) => {
        const key = title.replace(/^[EP]/, '');
        return totals[key] ?? 0;
    };

    useEffect(() => {
        setHeadings(prev =>
            prev.map(heading => {
                if (heading.subItems.length === 0) return heading;
                const sumOtherItems = heading.subItems.slice(1).reduce((sum, item) => sum + item.value, 0);
                const newFirstItemValue = getHeadingValueFromTotals(heading.title) - sumOtherItems;
                if (heading.subItems[0].value === newFirstItemValue) return heading;
                return {
                    ...heading,
                    subItems: [
                        { ...heading.subItems[0], value: newFirstItemValue },
                        ...heading.subItems.slice(1)
                    ]
                };
            })
        );
    }, [headings.map(h => h.subItems.map(s => s.value).join(',')).join('|'), totals]);

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over) return;
        const oldIndex = sortedIds.indexOf(active.id as string);
        const newIndex = sortedIds.indexOf(over.id as string);
        setSortedIds(arrayMove(sortedIds, oldIndex, newIndex));
    }

    const addNewItem = (headingId: string) => {
        const heading = headings.find(h => h.id === headingId);
        if (!heading) return;
        const newItemId = `item-${headingId.split('-')[1]}-${crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 10)}`;
        const newItem = { id: newItemId, parentId: headingId, value: 0 };
        setHeadings(prev => prev.map(h => h.id === headingId ? { ...h, subItems: [...h.subItems, newItem] } : h));
        setSortedIds(prev => {
            const lastSubItem = heading.subItems[heading.subItems.length - 1];
            const lastIndex = prev.findIndex(id => id === lastSubItem.id);
            const newSortedIds = [...prev];
            newSortedIds.splice(lastIndex + 1, 0, newItemId);
            return newSortedIds;
        });
    };

    const deleteItem = (itemId: string) => {
        setHeadings(prev =>
            prev.map(heading => {
                const itemIndex = heading.subItems.findIndex(item => item.id === itemId);
                if (itemIndex === -1) return heading;
                if (itemIndex > 0) {
                    return { ...heading, subItems: heading.subItems.filter(item => item.id !== itemId) };
                }
                if (heading.subItems.length > 1) {
                    return { ...heading, subItems: [{ ...heading.subItems[0], value: getHeadingValueFromTotals(heading.title) }, ...heading.subItems.slice(2)] };
                }
                return { ...heading, subItems: [{ ...heading.subItems[0], value: getHeadingValueFromTotals(heading.title) }] };
            })
        );
        setSortedIds(prev => prev.filter(id => id !== itemId));
    };

    const updateSubItemValue = (itemId: string, newValue: number) => {
        setHeadings(prev =>
            prev.map(heading => {
                const itemIndex = heading.subItems.findIndex(item => item.id === itemId);
                if (itemIndex === -1) return heading;
                newValue = Math.max(0, newValue);
                if (itemIndex === 0) return heading;
                const total = getHeadingValueFromTotals(heading.title);
                const sumOtherEditableItems = heading.subItems.filter((item, index) => item.id !== itemId && index > 0).reduce((sum, item) => sum + item.value, 0);
                const maxPossibleValue = total - sumOtherEditableItems - 10;
                const adjustedValue = Math.min(newValue, Math.max(0, maxPossibleValue));
                const newFirstItemValue = total - sumOtherEditableItems - adjustedValue;
                return {
                    ...heading,
                    subItems: heading.subItems.map((item, index) => {
                        if (index === 0) return { ...item, value: newFirstItemValue };
                        if (item.id === itemId) return { ...item, value: adjustedValue };
                        return item;
                    })
                };
            })
        );
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
                                    const item = headings.flatMap(h => h.subItems).find(i => i.id === id);
                                    return item ? (
                                        <SortableItem key={item.id} id={item.id}>
                                            <div className={styles.draggableButton}>
                                                {headings.find(h => h.id === item.parentId)?.title} ({item.value})
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
