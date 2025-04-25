import React from 'react';

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
    return (
        <>
            <tr>
                <td
                    rowSpan={3}
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
                        {typeof extraValue === 'number' ? extraValue * values[0].value : ""}
                    </td>
                ))}
            </tr>
            <tr>
                <td>{values[1].label}</td>
                <td>{values[1].code}</td>
                <td>{values[1].value}</td>
                {values[1].extraValues.map((extraValue, index) => (
                    <td key={index}>
                        {typeof extraValue === 'number' ? extraValue * values[1].value : ""}
                    </td>
                ))}
            </tr>
            <tr>
                <td>{values[2].label}</td>
                <td>{values[2].code}</td>
                <td>{values[2].value}</td>
                {values[2].extraValues.map((extraValue, index) => (
                    <td key={index}>
                        {typeof extraValue === 'number' ? extraValue * values[2].value : ""}
                    </td>
                ))}
            </tr>
        </>
    );
};

export default ProductTableThree;