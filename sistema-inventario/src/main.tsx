import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './estilos/global.css'
import './estilos/readability.css';
import './estilos/dark-mode.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('No se encontró el elemento raíz de la aplicación.');
}

createRoot(rootElement).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
