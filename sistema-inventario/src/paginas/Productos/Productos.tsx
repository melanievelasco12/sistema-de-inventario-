import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import Table from '../../componentes/Table/Table';
import { Icon } from '../../componentes/Icon';
import { productPrice } from '../../utils/formatters';
import type { Product } from '../../types';

interface ProductsProps {
    products: Product[];
    hasSearch: boolean;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
}

export default function Products({ products, hasSearch, onEdit, onDelete }: ProductsProps) {
    return _jsxs("section", { className: "panel table-panel products-table-panel", children: [_jsxs("div", { className: "table-meta", children: [_jsxs("span", { children: [products.length, " productos"] }), _jsx("span", { children: "Las existencias se actualizan con cada movimiento" })] }), _jsx(Table, { children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Categor\u00EDa" }), _jsx("th", { children: "Nombre" }), _jsx("th", { children: "Precio ($)" }), _jsx("th", { children: "Stock Actual" }), _jsx("th", { className: "actions-col", children: "Acciones" })] }) }), _jsx("tbody", { children: products.length
                                ? products.map((product) => _jsxs("tr", { children: [_jsx("td", { children: _jsx("span", { className: "category-pill", children: product.category }) }), _jsx("td", { children: _jsxs("div", { className: "catalog-product", children: [_jsx("strong", { children: product.name }), product.brand && _jsx("span", { className: "catalog-brand", children: product.brand }), product.code && _jsx("span", { children: product.code })] }) }), _jsx("td", { children: _jsx("strong", { className: "product-price", children: productPrice.format(product.price) }) }), _jsxs("td", { children: [_jsx("strong", { className: `catalog-stock${product.stock <= product.minStock ? ' low' : ''}`, children: product.stock }), " ", product.unit && _jsx("span", { className: "muted-unit", children: product.unit })] }), _jsx("td", { children: _jsxs("div", { className: "row-actions", children: [_jsx("button", { "aria-label": `Editar ${product.name}`, title: "Editar", onClick: () => onEdit(product), children: _jsx(Icon, { name: "edit" }) }), _jsx("button", { "aria-label": `Eliminar ${product.name}`, title: "Eliminar", onClick: () => onDelete(product), children: _jsx(Icon, { name: "trash" }) })] }) })] }, product.id))
                                : _jsx("tr", { children: _jsx("td", { className: "catalog-empty-cell", colSpan: 5, children: _jsxs("div", { className: "catalog-empty", role: "status", children: [_jsx("strong", { children: hasSearch ? 'No encontramos productos' : 'Aún no hay productos' }), _jsx("p", { children: hasSearch ? 'Prueba con otro término de búsqueda.' : 'Registra un producto para comenzar a organizar tu inventario.' })] }) }) }) })] }) })] });
}
