import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import Table from '../../componentes/Table/Table.jsx';
import { Icon } from '../../componentes/Icon.jsx';
import { EmptyState } from '../../componentes/common.jsx';

export default function Categories({ categories, error, saving, onEdit, onRegister, onDelete }) {
    if (error)
        return _jsx("div", { className: "alert error-alert", role: "alert", children: error });
    if (!categories.length)
        return _jsx(EmptyState, { title: "A\u00FAn no hay categor\u00EDas", detail: "Crea una categor\u00EDa para organizar los productos del inventario." });
    return _jsxs("section", { className: "panel table-panel", children: [_jsxs("div", { className: "table-meta", children: [_jsxs("span", { children: [categories.length, " categor\u00EDas"] }), _jsx("span", { children: "Las categor\u00EDas existentes se detectan desde tus productos" })] }), _jsx(Table, { children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Categor\u00EDa" }), _jsx("th", { children: "Productos" }), _jsx("th", { children: "Administraci\u00F3n" }), _jsx("th", { className: "actions-col", children: "Acciones" })] }) }), _jsx("tbody", { children: categories.map(([name, entry]) => {
                                const category = entry.category;
                                return _jsxs("tr", { children: [_jsx("td", { children: _jsxs("div", { className: "category-name", children: [_jsx("span", { className: "category-icon", children: _jsx(Icon, { name: "tag" }) }), _jsx("strong", { children: name })] }) }), _jsx("td", { children: entry.count }), _jsx("td", { children: _jsx("span", { className: `category-state ${category ? 'registered' : ''}`, children: category ? 'Administrada' : 'Detectada en productos' }) }), _jsx("td", { children: _jsx("div", { className: "row-actions", children: category
                                                    ? _jsxs(_Fragment, { children: [_jsx("button", { "aria-label": `Editar ${name}`, title: "Editar", onClick: () => onEdit(category), children: _jsx(Icon, { name: "edit" }) }), _jsx("button", { "aria-label": `Eliminar ${name}`, title: "Eliminar", disabled: saving || entry.count > 0, onClick: () => onDelete(category), children: _jsx(Icon, { name: "trash" }) })] })
                                                    : _jsx("button", { className: "register-category", disabled: saving, onClick: () => onRegister(name), children: "Registrar" }) }) })] }, name);
                            }) })] }) })] });
}
