// src/context/XmlDataContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type XmlDataType = any;

interface XmlDataContextProps {
    xmlData: XmlDataType;
    setXmlData: (data: XmlDataType) => void;
}

const XmlDataContext = createContext<XmlDataContextProps | undefined>(undefined);

export const XmlDataProvider = ({ children }: { children: ReactNode }) => {
    // Lade initiale Daten aus localStorage (falls vorhanden)
    const [xmlData, setXmlData] = useState<XmlDataType>(() => {
        if (typeof window !== 'undefined') {
            const storedData = localStorage.getItem('xmlData');
            if (storedData) {
                try {
                    return JSON.parse(storedData);
                } catch (error) {
                    console.error('Fehler beim Parsen von localStorage xmlData:', error);
                }
            }
        }
        return null;
    });

    // Speichere die Daten bei jeder Änderung im localStorage
    useEffect(() => {
        if (xmlData) {
            localStorage.setItem('xmlData', JSON.stringify(xmlData));
        }
    }, [xmlData]);

    return (
        <XmlDataContext.Provider value={{ xmlData, setXmlData }}>
            {children}
        </XmlDataContext.Provider>
    );
};

export const useXmlData = () => {
    const context = useContext(XmlDataContext);
    if (!context) {
        throw new Error('useXmlData must be used within an XmlDataProvider');
    }
    return context;
};
