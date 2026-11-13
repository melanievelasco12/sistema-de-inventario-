import type { PageView } from '../types';

export const pageDescriptions: Record<Exclude<PageView, 'dashboard'>, string> = {
    products: 'Gestiona los productos de tu inventario.',
    movements: 'Registra entradas y salidas y filtra el historial por día, mes o año.',
    reports: 'Consulta el estado de las existencias y descarga un resumen del inventario.',
    settings: 'Actualiza tu perfil y las preferencias de visualización.',
};
