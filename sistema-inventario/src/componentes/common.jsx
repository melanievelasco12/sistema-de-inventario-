import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Icon } from './Icon.jsx';
import { currency } from '../utils/formatters.js';

export function StatCard({ label, value, icon, tone, detail }) {
    return _jsxs("article", { className: "stat-card", children: [_jsx("div", { className: `stat-icon ${tone}`, children: _jsx(Icon, { name: icon }) }), _jsx("span", { className: "stat-label", children: label }), _jsx("strong", { className: "stat-value", children: currency.format(value) }), _jsx("span", { className: "stat-detail", children: detail })] });
}

export function StatusBadge({ low }) {
    return _jsxs("span", { className: `status-badge ${low ? 'status-low' : 'status-ok'}`, children: [_jsx("i", {}), low ? 'Stock bajo' : 'Disponible'] });
}

export function EmptyState({ title, detail }) {
    return _jsxs("div", { className: "empty-state", children: [_jsx("span", { className: "empty-mark", children: _jsx(Icon, { name: "search" }) }), _jsx("strong", { children: title }), _jsx("p", { children: detail })] });
}
