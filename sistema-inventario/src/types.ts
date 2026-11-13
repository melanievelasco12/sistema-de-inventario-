export type MovementType = 'entrada' | 'salida';

export type PageView = 'dashboard' | 'products' | 'movements' | 'reports' | 'settings';

export type ModalView = 'product' | 'movement' | null;

export interface Product {
    id: string;
    code: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    unit: string;
    stock: number;
    minStock: number;
    movementCount: number;
    lastMovementId: string | null;
    updatedAt: string;
}

export interface ProductInput {
    code: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    unit: string;
    stock: number;
    minStock: number;
}

export interface ProductUpdate {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    unit: string;
    minStock: number;
}

export interface Movement {
    id: string;
    productId: string;
    productName: string;
    type: MovementType;
    quantity: number;
    note: string;
    createdBy: string;
    createdAt: string;
}

export interface Category {
    id: string;
    name: string;
    createdAt: string;
}

export interface InventorySnapshot {
    products: Product[];
    movements: Movement[];
}

export interface DailyMovementTotals {
    date: Date;
    key: string;
    entrada: number;
    salida: number;
}

export interface CategoryStock {
    category: string;
    stock: number;
    color: string;
}
