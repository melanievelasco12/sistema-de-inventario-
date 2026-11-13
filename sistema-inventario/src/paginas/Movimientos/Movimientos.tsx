import { useState } from 'react';
import Table from '../../componentes/Table/Table';
import { EmptyState } from '../../componentes/common';
import type { Movement, MovementType } from '../../types';

const movementDateTime = new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

const monthFormatter = new Intl.DateTimeFormat('es-EC', { month: 'long', timeZone: 'UTC' });
const monthOptions = Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1),
    label: monthFormatter.format(new Date(Date.UTC(2024, index, 1))),
}));

function getMovementDate(value: string): Date | null {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

interface MovementsProps {
    movements: Movement[];
    onNew: (type: MovementType) => void;
}

export default function Movements({ movements, onNew }: MovementsProps) {
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [currentYear] = useState(() => new Date().getFullYear());
    const years = [...new Set([currentYear, ...movements
        .map((movement) => getMovementDate(movement.createdAt)?.getFullYear())
        .filter((movementYear): movementYear is number => movementYear !== undefined)])].sort((a, b) => b - a);
    const filteredMovements = movements.filter((movement) => {
        const date = getMovementDate(movement.createdAt);
        return date
            && (!day || date.getDate() === Number(day))
            && (!month || date.getMonth() + 1 === Number(month))
            && (!year || date.getFullYear() === Number(year));
    });
    const hasDateFilter = Boolean(day || month || year);

    return (
        <>
            <div className="movement-shortcuts">
                <button className="shortcut-card" onClick={() => onNew('entrada')}>
                    <span className="shortcut-icon entry-shortcut">↓</span>
                    <span><strong>Registrar entrada</strong><small>Agregar mercadería al inventario</small></span>
                    <b>→</b>
                </button>
                <button className="shortcut-card" onClick={() => onNew('salida')}>
                    <span className="shortcut-icon exit-shortcut">↑</span>
                    <span><strong>Registrar salida</strong><small>Descontar mercadería disponible</small></span>
                    <b>→</b>
                </button>
            </div>
            <section className="panel table-panel movement-history-panel">
                <div className="movement-date-filters" aria-label="Filtrar movimientos por fecha">
                    <label className="field movement-date-filter">
                        Día
                        <select value={day} onChange={(event) => setDay(event.target.value)}>
                            <option value="">Todos</option>
                            {Array.from({ length: 31 }, (_, index) => (
                                <option key={index + 1} value={index + 1}>{index + 1}</option>
                            ))}
                        </select>
                    </label>
                    <label className="field movement-date-filter">
                        Mes
                        <select value={month} onChange={(event) => setMonth(event.target.value)}>
                            <option value="">Todos</option>
                            {monthOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </label>
                    <label className="field movement-date-filter">
                        Año
                        <select value={year} onChange={(event) => setYear(event.target.value)}>
                            <option value="">Todos</option>
                            {years.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </label>
                    <span className="movement-filter-count">
                        {filteredMovements.length} de {movements.length} registros
                    </span>
                    {hasDateFilter && (
                        <button
                            type="button"
                            className="movement-filter-clear"
                            onClick={() => {
                                setDay('');
                                setMonth('');
                                setYear('');
                            }}
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
                <div className="table-meta">
                    <span>Historial de movimientos</span>
                    <span>{filteredMovements.length} registros</span>
                </div>
                <MovementTable movements={filteredMovements} hasDateFilter={hasDateFilter} />
            </section>
        </>
    );
}

interface MovementTableProps {
    movements: Movement[];
    hasDateFilter: boolean;
}

export function MovementTable({ movements, hasDateFilter }: MovementTableProps) {
    if (!movements.length) {
        return hasDateFilter
            ? <EmptyState title="No hay movimientos para esta fecha" detail="Prueba con otro día, mes o año, o limpia los filtros." />
            : <EmptyState title="Aún no hay movimientos" detail="Cuando registres una entrada o salida aparecerá aquí." />;
    }

    return (
        <Table>
            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Tipo</th>
                        <th>Cantidad</th>
                        <th>Nota</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    {movements.map((movement) => {
                        const date = getMovementDate(movement.createdAt);
                        return (
                            <tr key={movement.id}>
                                <td>
                                    <div className="product-cell">
                                        <div className="product-avatar">{movement.productName.slice(0, 1).toUpperCase()}</div>
                                        <div><strong>{movement.productName}</strong></div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`movement-type ${movement.type}`}>
                                        {movement.type === 'entrada' ? '↓ Entrada' : '↑ Salida'}
                                    </span>
                                </td>
                                <td>
                                    <strong className={movement.type === 'entrada' ? 'positive-quantity' : 'negative-quantity'}>
                                        {movement.type === 'entrada' ? '+' : '−'}{movement.quantity}
                                    </strong>
                                </td>
                                <td>{movement.note || <span className="muted-unit">—</span>}</td>
                                <td>{date ? movementDateTime.format(date) : '—'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </Table>
    );
}
