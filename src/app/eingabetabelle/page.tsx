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
import {useTranslation} from "react-i18next";

export default function App() {

    const [headings, setHeadings] = useState(initialData);
    const [sortedIds, setSortedIds] = useState(
        initialData.flatMap(heading => heading.subItems.map(item => item.id))
    );
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    const { t } = useTranslation();

    // Automatische Anpassung der ersten Zeile bei Änderungen
    useEffect(() => {
        setHeadings(prev =>
            prev.map(heading => {
                if (heading.subItems.length === 0) return heading;

                const sumOtherItems = heading.subItems.slice(1).reduce((sum, item) => sum + item.value, 0);
                const newFirstItemValue = heading.value - sumOtherItems;

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
    }, [headings.map(h => h.subItems.map(s => s.value).join(',')).join('|')]);

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const oldIndex = sortedIds.indexOf(activeId);
        const newIndex = sortedIds.indexOf(overId);

        setSortedIds(arrayMove(sortedIds, oldIndex, newIndex));
    }

    const addNewItem = (headingId: string) => {
        const heading = headings.find(h => h.id === headingId);
        if (!heading) return;

        // Verwende einen stabileren Unique Identifier (UUID empfohlen)
        const newItemId = `item-${headingId.split('-')[1]}-${crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 10)}`;

        const newItem = {
            id: newItemId,
            parentId: headingId,
            value: 0 // Setze den initialen Wert auf 0, damit es keinen negativen Wert gibt
        };

        // Update Headings: Neue Zeile hinzufügen
        setHeadings(prev =>
            prev.map(h =>
                h.id === headingId
                    ? { ...h, subItems: [...h.subItems, newItem] }
                    : h
            )
        );

        // Füge das neue Item direkt unterhalb der letzten Zeile dieses Headings ein
        setSortedIds(prev => {
            // Finde das letzte SubItem des Headings
            const lastSubItem = heading.subItems[heading.subItems.length - 1];

            // Berechne die Position des letzten SubItems in der sortierten Liste
            const lastIndex = prev.findIndex(id => id === lastSubItem.id);

            // Füge das neue Item direkt nach dem letzten SubItem ein
            const newSortedIds = [...prev];
            newSortedIds.splice(lastIndex + 1, 0, newItemId);
            return newSortedIds;
        });

        // Berechne die neue Zeile und stelle sicher, dass die Summe der Werte den Maximalwert nicht überschreitet
        setHeadings(prev =>
            prev.map(h => {
                if (h.id === headingId) {
                    // Berechne die verbleibende Differenz für die anderen Zeilen
                    const sumOtherItems = h.subItems.slice(1).reduce((sum, item) => sum + item.value, 0);
                    const newFirstItemValue = heading.value - sumOtherItems;

                    return {
                        ...h,
                        subItems: [
                            { ...h.subItems[0], value: newFirstItemValue }, // Setze den Wert der ersten Zeile auf den neuen Wert
                            ...h.subItems.slice(1)
                        ]
                    };
                }
                return h;
            })
        );
    };

    const deleteItem = (itemId: string) => {
        setHeadings(prev =>
            prev.map(heading => {
                // Finde den Index des zu löschenden Items
                const itemIndex = heading.subItems.findIndex(item => item.id === itemId);
                if (itemIndex === -1 || heading.id !== heading.subItems.find(item => item.id === itemId)?.parentId) {
                    return heading;
                }

                // Wenn es nicht die erste Zeile ist
                if (itemIndex > 0) {
                    return {
                        ...heading,
                        subItems: heading.subItems.filter(item => item.id !== itemId)
                    };
                }

                // Wenn es die erste Zeile ist und es weitere Zeilen gibt
                if (heading.subItems.length > 1) {
                    // Wert der ersten Zeile auf Heading-Wert setzen und zweite Zeile löschen
                    return {
                        ...heading,
                        subItems: [
                            { ...heading.subItems[0], value: heading.value },
                            ...heading.subItems.slice(2)
                        ]
                    };
                }

                // Wenn es die einzige Zeile ist
                return {
                    ...heading,
                    subItems: [{ ...heading.subItems[0], value: heading.value }]
                };
            })
        );

        // Entferne das Item aus der sortierten Liste
        setSortedIds(prev => prev.filter(id => id !== itemId));
    };

    const updateHeadingValue = (headingId: string, newValue: number) => {
        setHeadings(prev =>
            prev.map(heading =>
                heading.id === headingId
                    ? {
                        ...heading,
                        value: newValue,
                        subItems: [
                            { ...heading.subItems[0], value: newValue },
                            ...heading.subItems.slice(1)
                        ]
                    }
                    : heading
            )
        );
    };

    const updateSubItemValue = (itemId: string, newValue: number) => {
        setHeadings(prev =>
            prev.map(heading => {
                const itemIndex = heading.subItems.findIndex(item => item.id === itemId);
                if (itemIndex === -1 || heading.id !== heading.subItems.find(item => item.id === itemId)?.parentId) {
                    return heading;
                }

                // Sicherstellen, dass der Wert nicht negativ ist
                newValue = Math.max(0, newValue);

                // Wenn es die erste Zeile ist, ändern wir stattdessen den Heading-Wert
                if (itemIndex === 0) {
                    return {
                        ...heading,
                        value: newValue, // Setze den Wert der Überschrift auf den neuen Wert
                        subItems: [
                            { ...heading.subItems[0], value: newValue }, // Setze die erste Zeile auf den neuen Wert
                            ...heading.subItems.slice(1)
                        ]
                    };
                }

                // Für andere Zeilen normal aktualisieren
                const sumOtherItems = heading.subItems
                    .filter((_, index) => index !== 0) // Entferne die erste Zeile, da sie bereits mit heading.value übereinstimmt
                    .reduce((sum, item) => sum + item.value, 0);

                const remainingValue = heading.value - sumOtherItems; // Berechne den verbleibenden Wert

                // Wenn der neue Wert den verbleibenden Wert überschreiten würde, setze ihn auf den maximal möglichen Wert
                const adjustedValue = Math.min(newValue, remainingValue);

                return {
                    ...heading,
                    subItems: heading.subItems.map((item, index) => {
                        if (item.id === itemId) {
                            return { ...item, value: adjustedValue }; // Stelle sicher, dass der Wert den verbleibenden Wert nicht überschreitet
                        }
                        return item;
                    })
                };
            })
        );
    };

    return (
        <div className={styles.pageContainer}>
            <h2 className={styles.sectionTitle}>{t('inputtable.inputtable')}</h2>

            <div className={styles.mainContent}>
                {/* Linke Seite: Überschriften mit Eingabezeilen */}
                <div className={styles.itemList}>
                    {headings.map((heading) => (
                        <div key={heading.id} className={styles.headingSection}>
                            {/* Überschrift mit editierbarem Wert */}
                            <div className={styles.headingRow}>
                                <span className={styles.headingLabel}>{heading.title}</span>
                                <input
                                    type="number"
                                    className={styles.headingValueInput}
                                    value={heading.value}
                                    disabled={true}
                                    onChange={(e) =>
                                        updateHeadingValue(heading.id, Number(e.target.value))
                                    }
                                />
                            </div>

                            {/* Eingabezeilen */}
                            {heading.subItems.map((item, index) => (
                                <div key={item.id} className={styles.itemRow}>
                                    <input
                                        className={styles.numberInput}
                                        type="number"
                                        value={item.value}
                                        onChange={(e) =>
                                            updateSubItemValue(item.id, Math.max(0, Number(e.target.value))) // Stellen Sie sicher, dass der Wert nicht negativ wird
                                        }
                                        disabled={index === 0} // Erste Zeile ist nicht direkt editierbar
                                    />
                                    {index > 0 && ( // Löschen-Button nur für zusätzliche Zeilen
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

                            {/* Button zum Hinzufügen neuer Zeilen */}
                            <button
                                className={styles.addButton}
                                onClick={() => addNewItem(heading.id)}
                            >
                                {t('inputtable.split')}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Rechte Seite: Einspaltige Dropzone mit sortierbaren Items */}
                <div className={styles.dropZoneContainer}>
                    <DndContext
                        sensors={sensors}
                        onDragEnd={handleDragEnd}
                        collisionDetection={closestCenter}
                    >
                        <SortableContext
                            items={sortedIds}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className={styles.dropZone}>
                                {sortedIds.map((id) => {
                                    // Finde das entsprechende Item in den Headings
                                    let item = null;
                                    for (const heading of headings) {
                                        const foundItem = heading.subItems.find(i => i.id === id);
                                        if (foundItem) {
                                            item = foundItem;
                                            break;
                                        }
                                    }

                                    return item ? (
                                        <SortableItem key={item.id} id={item.id}>
                                            <div className={styles.draggableButton}>
                                                {headings.find(h => h.id === item.parentId)?.title} ({item.value})
                                                {validationErrors[item.parentId] && (
                                                    <span className={styles.errorIndicator}>!</span>
                                                )}
                                            </div>
                                        </SortableItem>
                                    ) : null;
                                })}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            {/* Ausgabe der Reihenfolge */}
            <div className={styles.sortOrder}>
                Aktuelle Reihenfolge: {sortedIds.join(', ')}
            </div>
        </div>
    );
}