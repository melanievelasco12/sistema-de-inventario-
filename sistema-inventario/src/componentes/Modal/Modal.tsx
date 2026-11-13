import type { MouseEvent, PropsWithChildren } from 'react';

interface ModalProps extends PropsWithChildren {
    className?: string;
    onClose: () => void;
}

export default function Modal({ children, className = '', onClose }: ModalProps) {
    function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
        if (event.target === event.currentTarget) onClose();
    }

    return (
        <div
            className={`modal-backdrop ${className}`.trim()}
            onMouseDown={handleBackdropMouseDown}
        >
            {children}
        </div>
    );
}
