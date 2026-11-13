import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import Navigation from './Navigation';
import type { User } from 'firebase/auth';
import type { PageView, Product } from '../types';

interface SidebarProps {
  view: PageView;
  lowStock: Product[];
  profileName: string;
  user: User;
  handleSignOut: () => void;
  onNavigate: (view: PageView) => void;
}

export default function Sidebar({ view, lowStock, profileName, user, handleSignOut, onNavigate }: SidebarProps) {
  return (_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "brand", children: [_jsx("div", { className: "brand-mark", children: _jsx("img", { src: "/pasostock-mark.svg", alt: "" }) }), _jsxs("div", { children: [_jsx("strong", { children: "PasoStock" }), _jsx("span", { children: "CONTROL DE INVENTARIO" })] })] }), _jsx("div", { className: "side-label", children: "MEN\u00DA PRINCIPAL" }), _jsx(Navigation, { view, lowStock, onNavigate }), _jsxs("div", { className: "sidebar-bottom", children: [_jsxs("div", { className: "help-card", children: [_jsx("span", { className: "help-icon", children: "\u2713" }), _jsxs("div", { children: [_jsx("strong", { children: "Inventario sincronizado" }), _jsx("p", { children: "Productos, categor\u00EDas, proveedores y movimientos se guardan en Firestore." })] })] }), _jsxs("div", { className: "user-profile", children: [_jsx("div", { className: "avatar", children: (profileName || user.email || 'U').slice(0, 1).toUpperCase() }), _jsxs("div", { children: [_jsx("strong", { children: profileName || user.email }), _jsx("span", { children: "Sesi\u00F3n autenticada" })] }), _jsx("button", { className: "signout-button", onClick: handleSignOut, children: "Salir" })] })] })] }));
}
