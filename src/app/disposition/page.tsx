'use client';

import React from 'react';
import { useXmlData } from '@/context/XmlDataContext';

export default function JsonViewPage() {
    const { xmlData } = useXmlData();

    if (!xmlData) {
        return <p>Keine Daten gefunden. Bitte lade zuerst deine XML-Datei.</p>;
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h2>XML-Daten als JSON</h2>
            <pre style={{
                backgroundColor: '#f5f5f5',
                padding: '1rem',
                borderRadius: '8px',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap'
            }}>
                {JSON.stringify(xmlData, null, 2)}
            </pre>
        </div>
    );
}
