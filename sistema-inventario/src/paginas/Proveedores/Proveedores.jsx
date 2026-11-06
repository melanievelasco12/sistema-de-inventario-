import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import Table from '../../componentes/Table/Table.jsx';
import { Icon } from '../../componentes/Icon.jsx';
import { EmptyState } from '../../componentes/common.jsx';

export default function Suppliers({ suppliers, error, onEdit, onDelete }) {
    if (error)
        return _jsx("div", { className: "alert error-alert", role: "alert", children: error });
    if (!suppliers.length)
        return _jsx(EmptyState, { title: "A\u00FAn no hay proveedores", detail: "Registra tus contactos para tener sus datos organizados en un solo lugar." });
    return _jsxs("section", { className: "panel table-panel", children: [_jsxs("div", { className: "table-meta", children: [_jsxs("span", { children: [suppliers.length, " proveedores"] }), _jsx("span", { children: "Datos de contacto guardados en Firestore" })] }), _jsx(Table, { children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Proveedor" }), _jsx("th", { children: "Tel\u00E9fono" }), _jsx("th", { children: "Correo electr\u00F3nico" }), _jsx("th", { children: "Direcci\u00F3n" }), _jsx("th", { className: "actions-col", children: "Acciones" })] }) }), _jsx("tbody", { children: suppliers.map((supplier) => _jsxs("tr", { children: [_jsx("td", { children: _jsxs("div", { className: "category-name", children: [_jsx("span", { className: "category-icon", children: _jsx(Icon, { name: "users" }) }), _jsx("strong", { children: supplier.name })] }) }), _jsx("td", { children: supplier.phone || _jsx("span", { className: "muted-unit", children: "\u2014" }) }), _jsx("td", { children: supplier.email || _jsx("span", { className: "muted-unit", children: "\u2014" }) }), _jsx("td", { children: supplier.address || _jsx("span", { className: "muted-unit", children: "\u2014" }) }), _jsx("td", { children: _jsxs("div", { className: "row-actions", children: [_jsx("button", { "aria-label": `Editar ${supplier.name}`, title: "Editar", onClick: () => onEdit(supplier), children: _jsx(Icon, { name: "edit" }) }), _jsx("button", { "aria-label": `Eliminar ${supplier.name}`, title: "Eliminar", onClick: () => onDelete(supplier), children: _jsx(Icon, { name: "trash" }) })] }) })] }, supplier.id)) })] }) })] });
}
