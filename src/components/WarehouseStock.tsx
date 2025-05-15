// src/hooks/useWarehouseStock.ts
import { useXmlData } from '@/context/XmlDataContext';

export function useWarehouseStock() {
    const { xmlData } = useXmlData();

    const getAmountForPart = (id: number): number => {
        const articles = xmlData?.results?.warehousestock?.article;
        if (!articles) return 0;

        // xml2js liefert entweder ein einzelnes Objekt oder ein Array
        const list = Array.isArray(articles) ? articles : [articles];

        // Suche den Artikel mit passender ID im $-Attribut
        const match = list.find((a: any) => Number(a.$.id) === id);

        // Gib den Amount zurück, wenn gefunden
        return match ? Number(match.$.amount) : 0;
    };

    return { getAmountForPart };
}
