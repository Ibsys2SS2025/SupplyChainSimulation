import React from 'react';

type Value = {
    label: string;
    code: string;
    value: number;
    extraValues: (number | string)[]; // Zusätzliche Werte pro Zeile
};

type ProductTableProps = {
    t: (key: string) => string;
    values: Value[];
    headerText: string;
};

const ProductTableOne: React.FC<ProductTableProps> = ({ t, values, headerText }) => {
    return (
        <>
            <tr>
                <td
                    className="wrapCell"
                    style={{ maxWidth: '150px', wordBreak: 'break-word' }}
                >
                    {t(headerText)}
                </td>
                <td>{values[0].label}</td>
                <td>{values[0].code}</td>
                <td>{values[0].value}</td>
                {values[0].extraValues.map((extraValue, index) => (
                    <td key={index}>
                        {typeof extraValue === 'number'
                            ? extraValue * values[0].value
                            : extraValue}
                    </td>
                ))}
            </tr>
        </>
    );
};

export default ProductTableOne;