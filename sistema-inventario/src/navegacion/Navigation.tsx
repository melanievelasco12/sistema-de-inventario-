import { Icon } from '../componentes/Icon';
import Button from '../componentes/Button/Button';
import type { IconName } from '../componentes/Icon';
import type { PageView, Product } from '../types';

const navigationItems: readonly (readonly [PageView, string, IconName])[] = [
  ['dashboard', 'Inicio', 'home'],
  ['products', 'Productos', 'box'],
  ['movements', 'Movimientos', 'arrows'],
  ['reports', 'Reportes', 'chart'],
  ['settings', 'Configuraci\u00f3n', 'settings'],
]

interface NavigationProps {
  view: PageView;
  lowStock: Product[];
  onNavigate: (view: PageView) => void;
}

export default function Navigation({ view, lowStock, onNavigate }: NavigationProps) {
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
