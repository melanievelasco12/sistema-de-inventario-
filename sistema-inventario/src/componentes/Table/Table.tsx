import { jsx as _jsx } from 'react/jsx-runtime';
import type { PropsWithChildren } from 'react';

interface TableProps extends PropsWithChildren {
    className?: string;
}

export default function Table({ className = '', children }: TableProps) {
    const classes = className ? `table-scroll ${className}` : 'table-scroll';
    return _jsx("div", { className: classes, children });
}
