'use client';

import React, { useState, useEffect } from 'react';
import SortableItem from '@/components/SortableItem';
import {
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import styles from './eingabetabelle.module.css';

export default function App() {
    // Initiale Datenstruktur mit Überschriften und je einer Standardzeile
    const initialData = [
        {
            id: 'heading-1',
            title: 'Item 1',
            value: 100,
            subItems: [
                { id: 'item-1-1', parentId: 'heading-1', value: 100 } // Startwert = Heading-Wert
            ]
        },
        {
            id: 'heading-2',
            title: 'Item 2',
            value: 200,
            subItems: [
                { id: 'item-2-1', parentId: 'heading-2', value: 200 }
            ]
        },
        {
            id: 'heading-3',
            title: 'Item 3',
            value: 300,
            subItems: [
                { id: 'item-3-1', parentId: 'heading-3', value: 300 }
            ]
        },
        {
            id: 'heading-4',
            title: 'Item 4',
            value: 100,
            subItems: [
                { id: 'item-4-1', parentId: 'heading-4', value: 100 }
            ]
        }
    ];

    const [headings, setHeadings] = useState(initialData);
    const [sortedIds, setSortedIds] = useState(
        initialData.flatMap(heading => heading.subItems.map(item => item.id))
    );
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    // Automatische Anpassung der ersten Zeile bei Änderungen
    useEffect(() => {
        setHeadings(prev =>
            prev.map(heading => {
                if (heading.subItems.length === 0) return heading;

                // Berechne Summe aller Zeilen außer der ersten
                const sumOtherItems = heading.subItems.slice(1).reduce((sum, item) => sum + item.value, 0);

                // Neue erste Zeile = Heading-Wert - Summe der anderen Zeilen
                const newFirstItemValue = heading.value - sumOtherItems;

                return {
                    ...heading,
                    subItems: [
                        { ...heading.subItems[0], value: newFirstItemValue },
                        ...heading.subItems.slice(1)
                    ]
                };
            })
        );
    }, [headings]);

    // Validierung (nur zur Anzeige von Fehlern, da Werte jetzt immer passen)
    const validateValues = () => {
        const errors: Record<string, string> = {};

        headings.forEach(heading => {
            const sum = heading.subItems.reduce((acc, item) => acc + item.value, 0);
            if (sum !== heading.value) {
                errors[heading.id] = `Summe muss ${heading.value} ergeben (aktuell: ${sum})`;
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    useEffect(() => {
        validateValues();
    }, [headings]);

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = sortedIds.indexOf(active.id as string);
            const newIndex = sortedIds.indexOf(over?.id as string);

            setSortedIds(arrayMove(sortedIds, oldIndex, newIndex));
        }
    }

    const addNewItem = (headingId: string) => {
        const heading = headings.find(h => h.id === headingId);
        if (!heading) return;

        const newItemId = `item-${headingId.split('-')[1]}-${Date.now()}`;
        const newItem = {
            id: newItemId,
            parentId: headingId,
            value: 0 // Neue Zeilen starten mit 0
        };

        setHeadings(prev =>
            prev.map(h =>
                h.id === headingId
                    ? { ...h, subItems: [...h.subItems, newItem] }
                    : h
            )
        );

        setSortedIds(prev => [...prev, newItemId]);
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

                // Wenn es die erste Zeile ist, ändern wir stattdessen den Heading-Wert
                if (itemIndex === 0) {
                    return {
                        ...heading,
                        value: newValue,
                        subItems: [
                            { ...heading.subItems[0], value: newValue },
                            ...heading.subItems.slice(1)
                        ]
                    };
                }

                // Für andere Zeilen normal aktualisieren
                return {
                    ...heading,
                    subItems: heading.subItems.map(item =>
                        item.id === itemId ? { ...item, value: newValue } : item
                    )
                };
            })
        );
    };

    return (
        <div className={styles.pageContainer}>
            <h2 className={styles.sectionTitle}>Sortierbare Dropzone mit Eingabe</h2>

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

                            {/* Validierungsfehler anzeigen */}
                            {validationErrors[heading.id] && (
                                <div className={styles.errorMessage}>
                                    {validationErrors[heading.id]}
                                </div>
                            )}

                            {/* Eingabezeilen */}
                            {heading.subItems.map((item, index) => (
                                <div key={item.id} className={styles.itemRow}>
                                    <input
                                        className={styles.numberInput}
                                        type="number"
                                        value={item.value}
                                        onChange={(e) =>
                                            updateSubItemValue(item.id, Number(e.target.value))
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
                                + Zeile hinzufügen
                            </button>
                        </div>
                    ))}
                </div>

                {/* Rechte Seite: Dropzone mit sortierbaren Items */}
                <div className={styles.dropZoneContainer}>
                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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