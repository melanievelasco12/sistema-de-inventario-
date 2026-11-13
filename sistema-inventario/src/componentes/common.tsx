import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Icon } from './Icon';
import { currency } from '../utils/formatters';
import type { IconName } from './Icon';

interface StatCardProps {
    label: string;
    value: number;
    icon: IconName;
    tone: string;
    detail: string;
}

export function StatCard({ label, value, icon, tone, detail }: StatCardProps) {
    return _jsxs("article", { className: "stat-card", children: [_jsx("div", { className: `stat-icon ${tone}`, children: _jsx(Icon, { name: icon }) }), _jsx("span", { className: "stat-label", children: label }), _jsx("strong", { className: "stat-value", children: currency.format(value) }), _jsx("span", { className: "stat-detail", children: detail })] });
}

export function StatusBadge({ low }: { low: boolean }) {
    return _jsxs("span", { className: `status-badge ${low ? 'status-low' : 'status-ok'}`, children: [_jsx("i", {}), low ? 'Stock bajo' : 'Disponible'] });
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
    return _jsxs("div", { className: "empty-state", children: [_jsx("span", { className: "empty-mark", children: _jsx(Icon, { name: "search" }) }), _jsx("strong", { children: title }), _jsx("p", { children: detail })] });
}
