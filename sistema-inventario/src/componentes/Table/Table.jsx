import { jsx as _jsx } from 'react/jsx-runtime';

export default function Table({ className = '', children }) {
    const classes = className ? `table-scroll ${className}` : 'table-scroll';
    return _jsx("div", { className: classes, children });
}
