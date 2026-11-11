import { useState } from 'react';
import Table from '../../componentes/Table/Table.jsx';
import { Icon } from '../../componentes/Icon.jsx';
import { StatCard, StatusBadge } from '../../componentes/common.jsx';
import { dateTime } from '../../utils/formatters.js';
import estilos from './Inicio.module.css';

// Cuántas filas se muestran en cada panel (los dos usan el mismo número para quedar parejos)
const FILAS_VISIBLES = 6;

export default function Dashboard({ products, movements, lowStock, onProducts, onMovements }) {
  const entradas = movements.filter((movement) => movement.type === 'entrada');
  const salidas = movements.filter((movement) => movement.type === 'salida');
  const unidadesEntradas = entradas.reduce((sum, movement) => sum + movement.quantity, 0);
  const unidadesSalidas = salidas.reduce((sum, movement) => sum + movement.quantity, 0);
  const [today] = useState(() => new Date());
  const actividadPorDia = new Map();
  movements.forEach((movement) => {
    const date = new Date(movement.createdAt);
    if (Number.isNaN(date.getTime()))
      return;
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const totals = actividadPorDia.get(key) ?? { entrada: 0, salida: 0 };
    if (movement.type === 'entrada')
      totals.entrada += movement.quantity;
    else if (movement.type === 'salida')
      totals.salida += movement.quantity;
    actividadPorDia.set(key, totals);
  });
  const actividad = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return { key, date, ...(actividadPorDia.get(key) ?? { entrada: 0, salida: 0 }) };
  });
  const maxActividad = Math.max(1, ...actividad.map((day) => day.entrada + day.salida));
  const etiquetaDia = new Intl.DateTimeFormat('es-EC', { weekday: 'short' });

  return (
    <>
      <section className={`stats-grid ${estilos.estadisticas}`}>
        <StatCard label="Productos registrados" value={products.length} icon="box" tone="lavender" detail="En el inventario" />
        <StatCard label="Productos con stock bajo" value={lowStock.length} icon="bell" tone="peach" detail="En o bajo el mínimo" />
        <StatCard label="Unidades ingresadas" value={unidadesEntradas} icon="entrada" tone="mint" detail={`En ${entradas.length} movimientos`} />
        <StatCard label="Unidades retiradas" value={unidadesSalidas} icon="salida" tone="blue" detail={`En ${salidas.length} movimientos`} />
      </section>

      <section className={estilos.cuadricula}>
        {/* Mitad izquierda: productos con stock bajo */}
        <section className={`panel ${estilos.panelStockBajo} ${lowStock.length ? estilos.panelAlerta : estilos.panelSaludable}`}>
          <div className="panel-heading">
            <div>
              <h2>Productos con stock bajo</h2>
              <p>Existencias iguales o inferiores al mínimo</p>
            </div>
            <span className={`warning-pill ${lowStock.length ? estilos.pildoraAlerta : estilos.pildoraSaludable}`}>
              {lowStock.length ? `${lowStock.length} ${lowStock.length === 1 ? 'requiere' : 'requieren'} atención` : 'Todo en orden'}
            </span>
          </div>

          {lowStock.length === 0 ? (
            <div className={`empty-state compact-empty ${estilos.vacio}`}>
              <span className="empty-mark"><Icon name="check" /></span>
              <strong>Todo en orden</strong>
              <p>Ningún producto está en su nivel mínimo.</p>
            </div>
          ) : (
            <Table className={estilos.scrollTabla}>
              <table className={estilos.tablaStock}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Existencias</th>
                    <th>Stock mínimo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.slice(0, FILAS_VISIBLES).map((product) => (
                    <tr key={product.id} className={estilos.filaStockBajo}>
                      <td>
                        <div className="product-cell">
                          <div className="product-avatar">{product.name.slice(0, 1).toUpperCase()}</div>
                          <div>
                            <strong>{product.name}</strong>
                            {product.code && <span>{product.code}</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong className="stock-current">{product.stock}</strong>{' '}
                        {product.unit && <span className="muted-unit">{product.unit}</span>}
                      </td>
                      <td>
                        {product.minStock} {product.unit && <span className="muted-unit">{product.unit}</span>}
                      </td>
                      <td><StatusBadge low /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Table>
          )}

          {lowStock.length > FILAS_VISIBLES && (
            <button className={`text-button ${estilos.enlaceStockBajo}`} onClick={onProducts}>
              Ver los {lowStock.length} productos <span>→</span>
            </button>
          )}
        </section>

        {/* Mitad derecha: movimientos recientes */}
        <section className={`panel ${estilos.panelRecientes}`}>
          <div className="panel-heading">
            <div>
              <h2>Movimientos recientes</h2>
              <p>Últimos registros del inventario</p>
            </div>
            <button className="text-button" onClick={onMovements}>
              Ver todos <span>→</span>
            </button>
          </div>

          <div className={estilos.resumenActividad}>
            <div className={estilos.encabezadoActividad}>
              <strong>Actividad · últimos 7 días</strong>
              <span><i className={estilos.leyendaEntrada} />Entradas <i className={estilos.leyendaSalida} />Salidas</span>
            </div>
            <div
              className={estilos.graficoActividad}
              role="img"
              aria-label={`Unidades recibidas y retiradas por día durante los últimos siete días: ${actividad.map((day) => `${etiquetaDia.format(day.date)} ${day.entrada} entradas y ${day.salida} salidas`).join(', ')}`}
            >
              {actividad.map((day) => {
                const total = day.entrada + day.salida;
                const height = total ? Math.max(4, total / maxActividad * 34) : 2;
                const entryHeight = total ? day.entrada / total * height : 0;
                const exitHeight = total ? day.salida / total * height : 0;
                return (
                  <div className={estilos.columnaActividad} key={day.key} title={`${day.entrada} entradas · ${day.salida} salidas`}>
                    <span className={estilos.barrasActividad}>
                      <i className={estilos.barraEntrada} style={{ height: `${entryHeight}px` }} />
                      <i className={estilos.barraSalida} style={{ height: `${exitHeight}px` }} />
                    </span>
                    <small>{etiquetaDia.format(day.date).replace('.', '')}</small>
                  </div>
                );
              })}
            </div>
          </div>

          {movements.length === 0 ? (
            <div className={`empty-state compact-empty ${estilos.vacio}`}>
              <strong>Aún no hay movimientos</strong>
              <p>Los registros aparecerán aquí.</p>
            </div>
          ) : (
            <ul className={estilos.listaMovimientos}>
              {movements.slice(0, FILAS_VISIBLES).map((movement) => (
                <li key={movement.id}>
                  <span
                    className={`${estilos.iconoMovimiento} ${estilos[movement.type]}`}
                    aria-hidden="true"
                  >
                    {movement.type === 'entrada' ? '↓' : '↑'}
                  </span>
                  <div className={estilos.infoMovimiento}>
                    <strong>{movement.productName}</strong>
                    <span>{dateTime.format(new Date(movement.createdAt))}</span>
                  </div>
                  <strong className={`${estilos.cantidadMovimiento} ${estilos[movement.type]}`}>
                    {movement.type === 'entrada' ? '+' : '−'}{movement.quantity}
                  </strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </>
  );
}