'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type XmlDataType = any;

interface XmlDataContextProps {
    xmlData: XmlDataType;
    setXmlData: (data: XmlDataType) => void;
}

const XmlDataContext = createContext<XmlDataContextProps | undefined>(undefined);

export const XmlDataProvider = ({ children }: { children: ReactNode }) => {
    // Lade xmlData initial aus localStorage
    const [xmlData, setXmlData] = useState<XmlDataType>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('xmlData');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch {
                    return null;
                }
            }
        }
        return null;
    });

    // Speichere xmlData bei jeder Änderung im localStorage
    useEffect(() => {
        if (xmlData && typeof window !== 'undefined') {
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
