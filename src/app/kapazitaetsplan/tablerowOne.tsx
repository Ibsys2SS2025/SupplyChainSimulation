import React from 'react';
import { useXmlData } from '@/context/XmlDataContext';

type Value = {
    label: string;
    code: string;
    value: number;
    extraValues: (number | string)[];
};

type ProductTableProps = {
    t: (key: string) => string;
    values: Value[];
    headerText: string;
};

const ProductTableOne: React.FC<ProductTableProps> = ({ t, values, headerText }) => {
    const { xmlData } = useXmlData();

    const getTotalForCode = (code: string): number | "" => {
        if (!xmlData?.internaldata?.totals) return "";
        const numericCode = Number(code);
        const total = xmlData.internaldata.totals[numericCode];
        console.log('Total: ', total, 'Code', code);
        if (total < 0) return 0;
        return total !== undefined ? Math.round(total) : "";
    };

    const item = values[0];
    const total = getTotalForCode(item.code);
    const updatedValue = typeof total === 'number' ? total : item.value;
    console.log('Original item.value:', item.value);
    console.log('Update:', updatedValue);

    return (
        <>
            <tr>
                <td
                    className="wrapCell"
                    style={{ maxWidth: '150px', wordBreak: 'break-word' }}
                >
                    {t(headerText)}
                </td>
                <td>{item.label}</td>
                <td>{item.code}</td>
                <td>{updatedValue}</td>
                {item.extraValues.map((extraValue, index) => (
                    <td key={index}>
                        {typeof extraValue === 'number'
                            ? Math.max(0, extraValue * updatedValue)
                            : ""}
                    </td>
                ))}
            </tr>
        </>
    );
};

export default ProductTableOne;
