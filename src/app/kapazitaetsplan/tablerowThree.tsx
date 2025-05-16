import React from 'react';

import { useXmlData } from '@/context/XmlDataContext';

type Value = {
    label: string;
    code: string;
    value: number;
    extraValues: (number | string)[]; // Auch leere Strings erlaubt
};

type ProductTableProps = {
    t: (key: string) => string;
    values: Value[];
    headerText: string;
};

const ProductTableThree: React.FC<ProductTableProps> = ({ t, values, headerText }) => {
    const { xmlData } = useXmlData();

    const getTotalForCode = (code: string): number | "" => {
        if (!xmlData?.internaldata?.totals) return "";
        const numericCode = Number(code);
        const total = xmlData.internaldata.totals[numericCode];
        if (total < 0) return 0;
        return total !== undefined ? Math.round(total) : "";
    };

    const updatedValues = values.map((item) => {
        const total = getTotalForCode(item.code);
        return {
            ...item,
            value: typeof total === 'number' ? total : item.value,
        };
    });

    return (
        <>
            {updatedValues.map((item, rowIndex) => (
                <tr key={rowIndex}>
                    {rowIndex === 0 && (
                        <td
                            rowSpan={updatedValues.length}
                            className="wrapCell"
                            style={{ maxWidth: '150px', wordBreak: 'break-word' }}
                        >
                            {t(headerText)}
                        </td>
                    )}
                    <td>{item.label}</td>
                    <td>{item.code}</td>
                    <td>{item.value}</td>
                    {item.extraValues.map((extraValue, index) => (
                        <td key={index}>
                            {typeof extraValue === 'number'
                                ? Math.max(0, extraValue * item.value)
                                : ""}
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
};

export default ProductTableThree;
