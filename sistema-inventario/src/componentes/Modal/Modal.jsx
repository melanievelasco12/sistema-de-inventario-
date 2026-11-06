export default function Modal({ children, className = '', onClose }) {
    function handleBackdropMouseDown(event) {
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
