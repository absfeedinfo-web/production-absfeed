export interface Product {
    code: string;
    name: string;
    bagSize: number;
    protein: string;
    category: "Poultry" | "Fish" | "Cattle";
}

export interface RawMaterial {
    id: string;
    name: string;
    unit: string;
}

export interface FormulaItem {
    materialId: string;
    amount: number;
    price: number; // Price per KG for this material
}

export interface ProductionEntry {
    id: string;
    batchNo: string;
    date: string;
    productCode: string;
    productName: string;
    partyName: string;
    bags: number;
    totalKgs: number;
    transportMill: number;
    transportBuyerDepot: number; // Renamed from transportParty
    bagCardCost: number;
    millingCharge: number;
    laborCost: number; // New field
    commission: number; // New field
    bakshish: number; // New field
    additionalCost: number;
    totalValue: number;
    formula: FormulaItem[];
    kgValue: number;
}

export type ExpenseCategory =
    | "Transport"
    | "Food"
    | "Labor"
    | "Salary"
    | "Permanent Asset"
    | "Event"
    | "Others";

export interface Expense {
    id: string;
    date: string;
    category: ExpenseCategory;
    amount: number;
    description: string;
    paymentMethod: "Cash" | "Bank" | "Mobile Banking";
}

export interface Stats {
    _id: null;
    total_bags: number;
    total_weight: number;
    total_production_value: number;
    total_expense: number;
}

export type UserRole = "admin" | "visitor";
