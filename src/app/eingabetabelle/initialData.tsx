const initialData = [
    {
        id: "heading-1",
        title: "E4",
        value: 0,
        workstations: "(A10,A11)",
        product: "1",
        subItems: [{ id: "item-1-1", parentId: "heading-1", value: 0, workstations: "(A10,A11)", product: "1" }]
    },
    {
        id: "heading-2",
        title: "E5",
        value: 0,
        workstations: "(A10,A11)",
        product: "2",
        subItems: [{ id: "item-2-1", parentId: "heading-2", value: 0, workstations: "(A10,A11)", product: "2" }]
    },
    {
        id: "heading-3",
        title: "E6",
        value: 0,
        workstations: "(A10,A11)",
        product: "3",
        subItems: [{ id: "item-3-1", parentId: "heading-3", value: 0, workstations: "(A10,A11)", product: "3"}]
    },
    {
        id: "heading-4",
        title: "E7",
        value: 0,
        workstations: "(A10,A11)",
        product: "1",
        subItems: [{ id: "item-4-1", parentId: "heading-4", value: 0, workstations: "(A10,A11)", product: "1" }]
    },
    {
        id: "heading-5",
        title: "E8",
        value: 0,
        workstations: "(A10,A11)",
        product: "2",
        subItems: [{ id: "item-5-1", parentId: "heading-5", value: 0, workstations: "(A10,A11)", product: "2" }]
    },
    {
        id: "heading-6",
        title: "E9",
        value: 0,
        workstations: "(A10,A11)",
        product: "3",
        subItems: [{ id: "item-6-1", parentId: "heading-6", value: 0, workstations: "(A10,A11)", product: "3" }]
    },
    {
        id: "heading-7",
        title: "E10",
        value: 0,
        workstations: "(A13,A12,A8,A7,A9)",
        product: "1",
        subItems: [{ id: "item-7-1", parentId: "heading-7", value: 0, workstations: "(A13,A12,A8,A7,A9)", product: "1" }]
    },
    {
        id: "heading-8",
        title: "E11",
        value: 0,
        workstations: "(A13,A12,A8,A7,A9)",
        product: "2",
        subItems: [{ id: "item-8-1", parentId: "heading-8", value: 0, workstations: "(A13,A12,A8,A7,A9)", product: "2"  }]
    },
    {
        id: "heading-9",
        title: "E12",
        value: 0,
        workstations: "(A13,A12,A8,A7,A9)",
        product: "3",
        subItems: [{ id: "item-9-1", parentId: "heading-9", value: 0, workstations: "(A13,A12,A8,A7,A9)", product: "3" }]
    },
    {
        id: "heading-10",
        title: "E13",
        value: 0,
        workstations: "(A13,A12,A8,A7,A9)",
        product: "1",
        subItems: [{ id: "item-10-1", parentId: "heading-10", value: 0, workstations: "(A13,A12,A8,A7,A9)", product: "1" }]
    },
    {
        id: "heading-11",
        title: "E14",
        value: 0,
        workstations: "(A13,A12,A8,A7,A9)",
        product: "2",
        subItems: [{ id: "item-11-1", parentId: "heading-11", value: 0, workstations: "(A13,A12,A8,A7,A9)", product: "2" }]
    },
    {
        id: "heading-12",
        title: "E15",
        value: 0,
        workstations: "(A13,A12,A8,A7,A9)",
        product: "3",
        subItems: [{ id: "item-12-1", parentId: "heading-12", value: 0, workstations: "(A13,A12,A8,A7,A9)", product: "3" }]
    },
    {
        id: "heading-13",
        title: "E16",
        value: 0,
        workstations: "(A6,A14)",
        product: "4",
        subItems: [{ id: "item-13-1", parentId: "heading-13", value: 0, workstations: "(A6,A14)", product: "4"  }]
    },
    {
        id: "heading-14",
        title: "E17",
        value: 0,
        workstations: "(A15)",
        product: "4",
        subItems: [{ id: "item-14-1", parentId: "heading-14", value: 0, workstations: "(A15)", product: "4" }]
    },
    {
        id: "heading-15",
        title: "E18",
        value: 0,
        workstations: "(A6,A8,A7,A9)",
        product: "1",
        subItems: [{ id: "item-15-1", parentId: "heading-15", value: 0, workstations: "(A6,A8,A7,A9)", product: "1" }]
    },
    {
        id: "heading-16",
        title: "E19",
        value: 0,
        workstations: "(A6,A8,A7,A9)",
        product: "2",
        subItems: [{ id: "item-16-1", parentId: "heading-16", value: 0, workstations: "(A6,A8,A7,A9)", product: "2" }]
    },
    {
        id: "heading-17",
        title: "E20",
        value: 0,
        workstations: "(A6,A8,A7,A9)",
        product: "3",
        subItems: [{ id: "item-17-1", parentId: "heading-17", value: 0, workstations: "(A6,A8,A7,A9)", product: "3" }]
    },
    {
        id: "heading-18",
        title: "E26",
        value: 0,
        workstations: "(A7,A15)",
        product: "4",
        subItems: [{ id: "item-18-1", parentId: "heading-18", value: 0, workstations: "(A7, A15)", product: "4" }]
    },
    {
        id: "heading-19",
        title: "E49",
        value: 0,
        workstations: "(A1)",
        product: "1",
        subItems: [{ id: "item-19-1", parentId: "heading-19", value: 0, workstations: "(A1)", product: "1" }]
    },
    {
        id: "heading-20",
        title: "E54",
        value: 0,
        workstations: "(A1)",
        product: "2",
        subItems: [{ id: "item-20-1", parentId: "heading-20", value: 0, workstations: "(A1)", product: "2" }]
    },
    {
        id: "heading-21",
        title: "E29",
        value: 0,
        workstations: "(A1)",
        product: "3",
        subItems: [{ id: "item-21-1", parentId: "heading-21", value: 0, workstations: "(A1)", product: "3" }]
    },
    {
        id: "heading-22",
        title: "E50",
        value: 0,
        workstations: "(A2)",
        product: "1",
        subItems: [{ id: "item-22-1", parentId: "heading-22", value: 0, workstations: "(A2)", product: "1" }]
    },
    {
        id: "heading-23",
        title: "E55",
        value: 0,
        workstations: "(A2)",
        product: "2",
        subItems: [{ id: "item-23-1", parentId: "heading-23", value: 0, workstations: "(A2)", product: "2" }]
    },
    {
        id: "heading-24",
        title: "E30",
        value: 0,
        workstations: "(A2)",
        product: "3",
        subItems: [{ id: "item-24-1", parentId: "heading-24", value: 0, workstations: "(A2)", product: "3" }]
    },
    {
        id: "heading-25",
        title: "E51",
        value: 0,
        workstations: "(A3)",
        product: "1",
        subItems: [{ id: "item-25-1", parentId: "heading-25", value: 0, workstations: "(A3)", product: "1" }]
    },
    {
        id: "heading-26",
        title: "E56",
        value: 0,
        workstations: "(A3)",
        product: "2",
        subItems: [{ id: "item-26-1", parentId: "heading-26", value: 0, workstations: "(A3)", product: "2" }]
    },
    {
        id: "heading-27",
        title: "E31",
        value: 0,
        workstations: "(A3)",
        product: "3",
        subItems: [{ id: "item-27-1", parentId: "heading-27", value: 0, workstations: "(A3)", product: "3" }]
    },
    {
        id: "heading-28",
        title: "P1",
        value: 0,
        workstations: "(A4)",
        product: "1",
        subItems: [{ id: "item-28-1", parentId: "heading-28", value: 0, workstations: "(A4)", product: "1" }]
    },
    {
        id: "heading-29",
        title: "P2",
        value: 0,
        workstations: "(A4)",
        product: "2",
        subItems: [{ id: "item-29-1", parentId: "heading-29", value: 0, workstations: "(A4)", product: "2" }]
    },
    {
        id: "heading-30",
        title: "P3",
        value: 0,
        workstations: "(A4)",
        product: "3",
        subItems: [{ id: "item-30-1", parentId: "heading-30", value: 0, workstations: "(A4)", product: "3" }]
    }
];

export default initialData;