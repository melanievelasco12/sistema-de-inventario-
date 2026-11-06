import { Icon } from '../componentes/Icon.jsx';
import Button from '../componentes/Button/Button.jsx';

const navigationItems = [
  ['dashboard', 'Inicio', 'home'],
  ['products', 'Productos', 'box'],
  ['movements', 'Movimientos', 'arrows'],
  ['categories', 'Categor\u00edas', 'tag'],
  ['suppliers', 'Proveedores', 'users'],
  ['reports', 'Reportes', 'chart'],
  ['settings', 'Configuraci\u00f3n', 'settings'],
]

export default function Navigation({ view, lowStock, onNavigate }) {
  return (
    <nav className="main-nav" aria-label={'Navegaci\u00f3n principal'}>
      {navigationItems.map(([key, label, icon]) => (
        <Button
          key={key}
          className={'nav-item ' + (view === key ? 'active' : '')}
          aria-label={label}
          aria-current={view === key ? 'page' : undefined}
          title={label}
          onClick={() => onNavigate(key)}
        >
          <Icon name={icon} />
          <span>{label}</span>
          {key === 'products' && lowStock.length > 0 && <span className="nav-count">{lowStock.length}</span>}
        </Button>
      ))}
    </nav>
  )
}
