// src/context/XmlDataContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type XmlDataType = any;

interface XmlDataContextProps {
    xmlData: XmlDataType;
    setXmlData: (data: XmlDataType) => void;
}

const XmlDataContext = createContext<XmlDataContextProps | undefined>(undefined);

export const XmlDataProvider = ({ children }: { children: ReactNode }) => {
    const [xmlData, setXmlData] = useState<XmlDataType>(null);

    return (
        <XmlDataContext.Provider value={{ xmlData, setXmlData }}>
            {children}
        </XmlDataContext.Provider>
    );
};

export const useXmlData = () => {
    const context = useContext(XmlDataContext);
    if (!context) {
        throw new Error('useXmlData must be used within a XmlDataProvider');
    }
    return context;
};
