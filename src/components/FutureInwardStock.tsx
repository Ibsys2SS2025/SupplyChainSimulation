import { useXmlData } from '@/context/XmlDataContext';

const getFutureInwardStock = (articleId: number): { period: number, amount: number, mode: number }[] => {
    const { xmlData } = useXmlData();
    const orders = xmlData?.results?.futureinwardstockmovement?.order;
    if (!orders) return [];

    const list = Array.isArray(orders) ? orders : [orders];

    return list
        .filter((o: any) => Number(o.$.article) === articleId)
        .map((o: any) => ({
            period: Number(o.$.orderperiod),
            amount: Number(o.$.amount),
            mode: Number(o.$.mode),
        }));
};
