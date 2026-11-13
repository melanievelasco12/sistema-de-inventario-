import { useState } from 'react';
import Table from '../../componentes/Table/Table';
import { Icon } from '../../componentes/Icon';
import { EmptyState, StatCard, StatusBadge } from '../../componentes/common';
import type { CategoryStock, DailyMovementTotals, Movement, MovementType, Product } from '../../types';

const chartColors = ['#5b8065', '#8eb69a', '#d2a66f', '#7b91b5', '#bd8270', '#9c88b8', '#c4b35e', '#75a9a7'];
const pieRadius = 42;
const pieCircumference = 2 * Math.PI * pieRadius;

function getCategoryStock(products: Product[]): CategoryStock[] {
    const stockByCategory = new Map();
    products.forEach((product) => {
        const category = product.category || 'Sin categoría';
        stockByCategory.set(category, (stockByCategory.get(category) ?? 0) + product.stock);
    });
    return [...stockByCategory]
        .map(([category, stock], index) => ({ category, stock, color: chartColors[index % chartColors.length] }))
        .filter((item) => item.stock > 0)
        .sort((a, b) => b.stock - a.stock);
}

function getRecentMovementTotals(movements: Movement[]): DailyMovementTotals[] {
    const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (6 - index));
        return {
            date,
            key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
            entrada: 0,
            salida: 0,
        };
    });
    const byDate = new Map(days.map((day) => [day.key, day]));

    movements.forEach((movement) => {
        const date = new Date(movement.createdAt);
        if (Number.isNaN(date.getTime()))
            return;
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const day = byDate.get(key);
        if (day && (movement.type === 'entrada' || movement.type === 'salida'))
            day[movement.type] += movement.quantity;
    });

    return days;
}

function CategoryPieChart({ items }: { items: CategoryStock[] }) {
    const total = items.reduce((sum, item) => sum + item.stock, 0);
    const segments = items.map((item, index) => ({
        ...item,
        length: item.stock / total * pieCircumference,
        offset: items.slice(0, index).reduce((sum, previous) => sum + previous.stock / total * pieCircumference, 0),
    }));

    return (
        <div className="report-pie-layout">
            <svg className="report-pie" viewBox="0 0 120 120" role="img" aria-label={`Existencias por categoría: ${items.map((item) => `${item.category}, ${item.stock}`).join('; ')}`}>
                <circle cx="60" cy="60" r={pieRadius} fill="none" stroke="#edf0ed" strokeWidth="18" />
                {segments.map((segment) => (
                    <circle
                        key={segment.category}
                        cx="60"
                        cy="60"
                        r={pieRadius}
                        fill="none"
                        stroke={segment.color}
                        strokeWidth="18"
                        strokeDasharray={`${segment.length} ${pieCircumference - segment.length}`}
                        strokeDashoffset={-segment.offset}
                        transform="rotate(-90 60 60)"
                    />
                ))}
                <text x="60" y="57" textAnchor="middle" className="report-pie-total">{total}</text>
                <text x="60" y="70" textAnchor="middle" className="report-pie-caption">unidades</text>
            </svg>
            <ul className="report-chart-legend">
                {items.map((item) => (
                    <li key={item.category}>
                        <span className="report-legend-swatch" style={{ backgroundColor: item.color }} />
                        <span className="report-legend-label" title={item.category}>{item.category}</span>
                        <strong>{item.stock}</strong>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function MovementLineChart({ days }: { days: DailyMovementTotals[] }) {
    const chartWidth = 360;
    const chartHeight = 160;
    const plotTop = 12;
    const plotBottom = 122;
    const plotHeight = plotBottom - plotTop;
    const maxValue = Math.max(1, ...days.flatMap((day) => [day.entrada, day.salida]));
    const pointX = (index: number) => 30 + index * 50;
    const pointY = (value: number) => plotBottom - value / maxValue * plotHeight;
    const linePath = (type: MovementType) => days.map((day, index) => `${index === 0 ? 'M' : 'L'} ${pointX(index)} ${pointY(day[type])}`).join(' ');
    const dateLabel = new Intl.DateTimeFormat('es-EC', { day: '2-digit', month: 'short' });

    return (
        <div className="report-line-wrap">
            <svg className="report-line-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={`Unidades ingresadas y retiradas por día durante los últimos siete días. ${days.map((day) => `${dateLabel.format(day.date)}: ${day.entrada} entradas y ${day.salida} salidas`).join('; ')}`}>
                {[0, 0.5, 1].map((fraction) => {
                    const y = plotBottom - fraction * plotHeight;
                    return <line key={fraction} x1="30" x2="330" y1={y} y2={y} className="report-chart-gridline" />;
                })}
                <path d={linePath('entrada')} className="report-line-entry" />
                <path d={linePath('salida')} className="report-line-exit" />
                {days.map((day, index) => (
                    <g key={day.key}>
                        <circle cx={pointX(index)} cy={pointY(day.entrada)} r="3" className="report-line-point-entry" />
                        <circle cx={pointX(index)} cy={pointY(day.salida)} r="3" className="report-line-point-exit" />
                        <text x={pointX(index)} y="145" textAnchor="middle" className="report-line-label">{dateLabel.format(day.date)}</text>
                    </g>
                ))}
            </svg>
            <div className="report-line-legend">
                <span><i className="report-legend-swatch report-entry-swatch" />Entradas</span>
                <span><i className="report-legend-swatch report-exit-swatch" />Salidas</span>
            </div>
        </div>
    );
}

interface ReportsProps {
    products: Product[];
    movements: Movement[];
    lowStock: Product[];
    onExport: () => void;
}

export default function Reports({ products, movements, lowStock, onExport }: ReportsProps) {
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('');
    const entries = movements.filter((movement) => movement.type === 'entrada').reduce((sum, item) => sum + item.quantity, 0);
    const exits = movements.filter((movement) => movement.type === 'salida').reduce((sum, item) => sum + item.quantity, 0);
    const categories = [...new Set(products.map((product) => product.category))].sort((a, b) => a.localeCompare(b, 'es'));
    const categoryStock = getCategoryStock(products);
    const recentMovementTotals = getRecentMovementTotals(movements);
    const filteredProducts = products.filter((product) => {
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'low' ? product.stock <= product.minStock : product.stock > product.minStock);
        return matchesStatus && (!categoryFilter || product.category === categoryFilter);
    });

    return (
        <div className="reports-content">
            <section className="stats-grid report-stats">
                <StatCard label="Productos registrados" value={products.length} icon="box" tone="lavender" detail="Productos activos" />
                <StatCard label="Unidades disponibles" value={products.reduce((sum, product) => sum + product.stock, 0)} icon="arrows" tone="mint" detail="Existencias totales" />
                <StatCard label="Unidades ingresadas" value={entries} icon="chart" tone="blue" detail="Según historial guardado" />
                <StatCard label="Unidades retiradas" value={exits} icon="arrows" tone="peach" detail="Según historial guardado" />
            </section>

            <section className="report-charts" aria-label="Gráficos del inventario">
                <article className="panel report-chart-panel">
                    <div className="panel-heading">
                        <div>
                            <h2>Existencias por categoría</h2>
                            <p>Distribución de unidades disponibles</p>
                        </div>
                    </div>
                    {categoryStock.length === 0
                        ? <EmptyState title="Aún no hay existencias" detail="El gráfico aparecerá cuando registres productos con stock." />
                        : <CategoryPieChart items={categoryStock} />}
                </article>
                <article className="panel report-chart-panel">
                    <div className="panel-heading">
                        <div>
                            <h2>Movimiento de inventario</h2>
                            <p>Unidades ingresadas y retiradas por día · últimos 7 días</p>
                        </div>
                    </div>
                    <MovementLineChart days={recentMovementTotals} />
                </article>
            </section>

            <section className="panel table-panel report-table">
                <div className="panel-heading report-heading">
                    <div>
                        <h2>Estado actual del inventario</h2>
                        <p>{lowStock.length} productos requieren reposición</p>
                    </div>
                    <button className="button button-outline" onClick={onExport}><Icon name="download" />Descargar CSV</button>
                </div>
                <div className="report-filters">
                    <label className="field report-filter">
                        Estado
                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            <option value="all">Todos los estados</option>
                            <option value="low">Stock bajo</option>
                            <option value="available">Sobre el mínimo</option>
                        </select>
                    </label>
                    <label className="field report-filter">
                        Categoría
                        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                            <option value="">Todas las categorías</option>
                            {categories.map((category) => <option value={category} key={category}>{category}</option>)}
                        </select>
                    </label>
                    <span className="report-result-count">{filteredProducts.length} de {products.length} productos</span>
                </div>
                {filteredProducts.length === 0
                    ? <EmptyState title="No hay productos para estos filtros" detail="Cambia el estado o la categoría para consultar otros productos." />
                    : (
                        <Table>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Producto</th>
                                        <th>Categoría</th>
                                        <th>Existencias</th>
                                        <th>Mínimo</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td className="code-cell">{product.code}</td>
                                            <td><strong>{product.name}</strong></td>
                                            <td>{product.category}</td>
                                            <td><strong>{product.stock} {product.unit}</strong></td>
                                            <td>{product.minStock} {product.unit}</td>
                                            <td><StatusBadge low={product.stock <= product.minStock} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Table>
                    )}
            </section>
        </div>
    );
}
