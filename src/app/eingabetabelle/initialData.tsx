// initialData.js

const titles = [
    'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11', 'E12', 'E13',
    'E14', 'E15', 'E16', 'E17', 'E18', 'E19', 'E20', 'E26', 'E49', 'E54',
    'E29', 'E50', 'E55', 'E30', 'E51', 'E56', 'E31', 'P1', 'P2', 'P3'
];

const initialData = titles.map((title, index) => {
    const id = `heading-${index + 1}`;
    return {
        id,
        title,
        value: 100,
        subItems: [{
            id: `item-${index + 1}-1`,
            parentId: id,
            value: 100
        }]
    };
});

export default initialData;
