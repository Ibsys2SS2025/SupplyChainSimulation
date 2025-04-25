'use client';

import React from 'react';
import { useXmlData } from '@/context/XmlDataContext';
import styles from "@/app/kapazitaetsplan/table.module.css";
import Sidebar from "@/components/Sidebar";
import {useTranslation} from "react-i18next";
import ProductTableThree from './tablerowThree';
import ProductTableOne from "@/app/kapazitaetsplan/tablerowOne";
import {
    backWheelValues,
    frontWheelValues,
    mudguardbackValues,
    mudguardfrontValues,
    barValues,
    saddleValues,
    frameValues,
    pedalValues,
    frontwheelcompleteValues,
    framewheelsValues,
    bikewithoutpedalsvalues,
    bikecompleteValues
} from './productValues';

interface ProductComponent {
    label: string;
    code: string;
    value: number;
    extraValues: (string | number)[];
}

const calculateColumnSums = (productComponents: ProductComponent[]) => {
    const sums = Array(15).fill(0);

    productComponents.forEach(component => {
        component.extraValues.forEach((extraValue, index) => {
            if (typeof extraValue === 'number') {
                sums[index] += extraValue * component.value;
            }
        });
    });
    return sums;
};

export default function JsonViewPage() {
    const { xmlData } = useXmlData();

    if (!xmlData) {
        return <p>Keine Daten gefunden. Bitte lade zuerst deine XML-Datei.</p>;
    }

    const { t} = useTranslation();

    const allProductComponents: ProductComponent[] = [
        ...backWheelValues,
        ...frontWheelValues,
        ...mudguardbackValues,
        ...mudguardfrontValues,
        barValues,
        saddleValues,
        ...frameValues,
        pedalValues,
        ...frontwheelcompleteValues,
        ...framewheelsValues,
        ...bikewithoutpedalsvalues,
        ...bikecompleteValues
    ].flat();

    const columnSums = calculateColumnSums(allProductComponents);

    return (
        <div className={styles.pageContainer}>
            <Sidebar />
            <div className={styles.content}>
                <h2 className={styles.sectionTitle}>{t('capacity.title')}</h2>
                <div className={styles.tableContainer}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th></th>
                                <th colSpan={18}>{t('capacity.workstation')}</th>
                            </tr>

                            <tr>
                                <th>{t('capacity.product')}</th>
                                <th>{t('capacity.bikemodell')}</th>
                                <th>{t('capacity.itemnumber')}</th>
                                <th>{t('capacity.orderquantity')}</th>
                                <th>1</th>
                                <th>2</th>
                                <th>3</th>
                                <th>4</th>
                                <th>5</th>
                                <th>6</th>
                                <th>7</th>
                                <th>8</th>
                                <th>9</th>
                                <th>10</th>
                                <th>11</th>
                                <th>12</th>
                                <th>13</th>
                                <th>14</th>
                                <th>15</th>
                            </tr>
                            </thead>
                            <tbody>
                            <ProductTableThree
                                t={t}
                                values={backWheelValues}
                                headerText="capacity.backwheel"
                            />
                            <ProductTableThree
                                t={t}
                                values={frontWheelValues}
                                headerText="capacity.frontwheel"
                            />
                            <ProductTableThree
                                t={t}
                                values={mudguardbackValues}
                                headerText="capacity.mudguardback"
                            />
                            <ProductTableThree
                                t={t}
                                values={mudguardfrontValues}
                                headerText="capacity.mudguardfront"
                            />
                            <ProductTableOne
                                t={t}
                                values={barValues}
                                headerText="capacity.bar"
                            />
                            <ProductTableOne
                                t={t}
                                values={saddleValues}
                                headerText="capacity.saddle"
                            />
                            <ProductTableThree
                                t={t}
                                values={frameValues}
                                headerText="capacity.frame"
                            />
                            <ProductTableOne
                                t={t}
                                values={pedalValues}
                                headerText="capacity.pedal"
                            />
                            <ProductTableThree
                                t={t}
                                values={frontwheelcompleteValues}
                                headerText="capacity.frontwheelcomplete"
                            />
                            <ProductTableThree
                                t={t}
                                values={framewheelsValues}
                                headerText="capacity.framewheels"
                            />
                            <ProductTableThree
                                t={t}
                                values={bikewithoutpedalsvalues}
                                headerText="capacity.bikewithoutpedals"
                            />
                            <ProductTableThree
                                t={t}
                                values={bikecompleteValues}
                                headerText="capacity.bike"
                            />
                            </tbody>
                            <tfoot>
                            <tr className={styles.sumRow}>
                                <td colSpan={3}>{t('capacity.new')}</td>
                                <td></td>
                                {columnSums.map((sum, index) => (
                                    <td key={`sum-${index}`}>{sum}</td>
                                ))}
                            </tr>
                            <tr className={styles.setupRow}>
                                <td colSpan={3}>{t('capacity.setuptimeNew')}</td>
                                <td colSpan={16}></td>
                            </tr>
                            <tr className={styles.setupRow}>
                                <td colSpan={3}>{t('capacity.capacityrequirementOld')}</td>
                                <td colSpan={16}></td>
                            </tr>
                            <tr className={styles.setupRow}>
                                <td colSpan={3}>{t('capacity.setuptimeOld')}</td>
                                <td colSpan={16}></td>
                            </tr>
                            <tr className={styles.sumRowNew}>
                                <td colSpan={3}>{t('capacity.totalcapacityreq')}</td>
                                <td colSpan={16}></td>
                            </tr>
                            <tr className={styles.setupRow}>
                                <td colSpan={3}>{t('capacity.overtime')}</td>
                                <td colSpan={16}></td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}