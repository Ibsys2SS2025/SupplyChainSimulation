
"use client";

import React, { useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const Sidebar: React.FC = () => {
    // State, ob die Unterpunkte angezeigt werden sollen
    const [showSetupItems, setShowSetupItems] = useState(false);

    // Falls du i18n verwenden möchtest
    const { t } = useTranslation();

    // Liste deiner Unterpunkte
    const subItems = [
        t('Produktionsplan'),
        t('Stücklistenauflösung'),
        t('Kapazitätsplan'),
        t('Teileverwendungsnachweis'),
        t('Losgrößen'),
        t('Export'),
    ];

    const handleSetupClick = () => {
        // Beim Klicken togglen wir das Anzeigen der Unterpunkte
        setShowSetupItems((prev) => !prev);
    };

    return (
        <div style={{ width: '200px' }}>
            <ListGroup>
                {/* Haupt-Eintrag Setup */}
                <ListGroup.Item action onClick={handleSetupClick}>
                    {t('Setup')}
                </ListGroup.Item>

                {/* Unterpunkte, die nur sichtbar werden, wenn showSetupItems true ist */}
                {showSetupItems && (
                    <>
                        {subItems.map((item, index) => (
                            <ListGroup.Item key={index} action>
                                {item}
                            </ListGroup.Item>
                        ))}
                    </>
                )}
            </ListGroup>
        </div>
    );
};

export default Sidebar;
