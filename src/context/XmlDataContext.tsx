'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type XmlDataType = any;

interface XmlDataContextProps {
    xmlData: XmlDataType;
    setXmlData: (data: XmlDataType) => void;
    tabInputs: TabInputs;
    updateInput: (productId: string, id: string, index: number, value: number) => void;
}

const XmlDataContext = createContext<XmlDataContextProps | undefined>(undefined);

const MULTI_USE_IDS = ['16', '17', '26'];

export type TabInputs = Record<string, Record<string, number[]>>;

const TAB_CONFIG = [
    { productId: 'P1', dynamicIds: ['26', '51', '16', '17', '50', '4', '10', '49', '7', '13', '18'], rowsWithSpacing: ['51', '50', '49'] },
    { productId: 'P2', dynamicIds: ['26', '56', '16', '17', '55', '5', '11', '54', '8', '14', '19'], rowsWithSpacing: ['56', '55', '54'] },
    { productId: 'P3', dynamicIds: ['26', '31', '16', '17', '30', '6', '12', '29', '9', '15', '20'], rowsWithSpacing: ['31', '30', '29'] }
];

export const XmlDataProvider = ({ children }: { children: ReactNode }) => {
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

    const [tabInputs, setTabInputs] = useState<TabInputs>({});

    const updateInput = (productId: string, id: string, index: number, value: number) => {
        setTabInputs(prev => {
            const newInputs = { ...prev };
            const productInputs = { ...newInputs[productId] };
            const values = [...(productInputs[id] ?? [0, 0, 0])];
            values[index] = value;
            productInputs[id] = values;
            newInputs[productId] = productInputs;
            return newInputs;
        });
    };

    const getAmountById = (id: string): number => {
        const whs = xmlData?.results?.warehousestock;
        const articles = Array.isArray(whs?.article) ? whs.article : [whs?.article];
        const value = articles.find((a: any) => a?.$?.id === id)?.$?.amount;
        const raw = value ? Number(value) : 0;
        return MULTI_USE_IDS.includes(id) ? raw / 3 : raw;
    };

    const getForecastValue = (productId: string): number => {
        const forecast = xmlData?.results?.forecast?.$;
        if (!forecast) return 0;
        const key = productId.toLowerCase(); // z.B. "p1", "p2", "p3"
        return Number(forecast[key]) || 0;
    };

    useEffect(() => {
        if (!xmlData) return;

        const totals: Record<string, number> = {};

        for (const tab of TAB_CONFIG) {
            const { productId, dynamicIds, rowsWithSpacing } = tab;
            const inputs = tabInputs[productId];
            if (!inputs) continue;

            const get = (id: string) => inputs[id] ?? [0, 0, 0];
            let lastTotal = 0;
            let lastWarteschlange = 0;

            const mainId = productId;
            const [s, w, i] = get(mainId);
            const production = getForecastValue(mainId);
            const stock = getAmountById(mainId.replace('P', ''));
            let mainTotal = production + s - stock - w - i;
            if (mainTotal < 0) mainTotal = 0;
            mainTotal = Math.round(mainTotal);

            const key = MULTI_USE_IDS.includes(mainId) ? mainId : mainId.replace('P', '');
            totals[key] = mainTotal;
            lastTotal = mainTotal;
            lastWarteschlange = w;

            for (const id of dynamicIds) {
                const [s2, w2, i2] = get(id);
                const stock2 = getAmountById(id);
                let total = lastTotal + lastWarteschlange + s2 - stock2 - w2 - i2;
                if (total < 0) total = 0;

                const key = MULTI_USE_IDS.includes(id) ? id : id.replace('P', '');

                if (MULTI_USE_IDS.includes(id)) {
                    // Add total (unrounded!) für Mehrfachverwendteile
                    totals[key] = (totals[key] ?? 0) + total;
                } else if (!(key in totals)) {
                    totals[key] = Math.round(total);
                }

                if (rowsWithSpacing.includes(id)) {
                    lastTotal = total;
                    lastWarteschlange = w2;
                }
            }
        }

        const roundInt = (val: number) => Math.round(val + Number.EPSILON);

        for (const id of MULTI_USE_IDS) {
            if (totals[id] !== undefined) {
                totals[id] = roundInt(totals[id]);
            }
        }

        setXmlData((prev: XmlDataType) => ({
            ...prev,
            internaldata: {
                ...prev.internaldata,
                totals
            }
        }));
    }, [tabInputs, xmlData?.results, xmlData?.internaldata?.planning]);

    useEffect(() => {
        if (xmlData && typeof window !== 'undefined') {
            localStorage.setItem('xmlData', JSON.stringify(xmlData));
        }
    }, [xmlData]);

    return (
        <XmlDataContext.Provider value={{ xmlData, setXmlData, tabInputs, updateInput }}>
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
