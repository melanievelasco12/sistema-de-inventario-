import Table from '../../componentes/Table/Table.jsx';
import { Icon } from '../../componentes/Icon.jsx';
import { StatCard, StatusBadge } from '../../componentes/common.jsx';
import { dateTime } from '../../utils/formatters.js';
import estilos from './Inicio.module.css';

// Cuántas filas se muestran en cada panel (los dos usan el mismo número para quedar parejos)
const FILAS_VISIBLES = 6;

export default function Dashboard({ products, movements, lowStock, onProducts, onMovements }) {
  const entradas = movements.filter((movement) => movement.type === 'entrada').length;
  const salidas = movements.filter((movement) => movement.type === 'salida').length;

  return (
    <>
      <section className="stats-grid">
        <StatCard label="Productos registrados" value={products.length} icon="box" tone="lavender" detail="En el inventario" />
        <StatCard label="Productos con stock bajo" value={lowStock.length} icon="bell" tone="peach" detail="En o bajo el mínimo" />
        <StatCard label="Entradas" value={entradas} icon="entrada" tone="mint" detail="Movimientos de entrada" />
        <StatCard label="Salidas" value={salidas} icon="salida" tone="blue" detail="Movimientos de salida" />
      </section>

      <section className={estilos.cuadricula}>
        {/* Mitad izquierda: productos con stock bajo */}
        <section className={`panel ${estilos.panelStockBajo}`}>
          <div className="panel-heading">
            <div>
              <h2>Productos con stock bajo</h2>
              <p>Existencias iguales o inferiores al mínimo</p>
            </div>
            <span className="warning-pill">{lowStock.length} productos</span>
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
                    <tr key={product.id}>
                      <td>
                        <div className="product-cell">
                          <div className="product-avatar">{product.name.slice(0, 1).toUpperCase()}</div>
                          <div>
                            <strong>{product.name}</strong>
                            <span>{product.code}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong className="stock-current">{product.stock}</strong>{' '}
                        <span className="muted-unit">{product.unit}</span>
                      </td>
                      <td>
                        {product.minStock} <span className="muted-unit">{product.unit}</span>
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