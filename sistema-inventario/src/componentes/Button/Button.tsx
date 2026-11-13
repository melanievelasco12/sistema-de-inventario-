import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ className, children, type = 'button', ...props }: ButtonProps) {
    return (
        <button type={type} className={className} {...props}>
            {children}
        </button>
    );
}
