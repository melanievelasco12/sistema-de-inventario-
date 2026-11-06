import { browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail, setPersistence, signInWithEmailAndPassword, signInWithRedirect, signOut, updateProfile } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { auth, firebaseConfigured } from './config/firebase';
import { createProduct, createCategory, createSupplier, deleteCategory, deleteProduct, deleteSupplier, getInventoryErrorMessage, registerMovement, subscribeToInventory, subscribeToCategories, subscribeToSuppliers, updateCategory, updateProduct, updateSupplier } from './config/firestore';
import { Icon } from './componentes/Icon.jsx';
import Modal from './componentes/Modal/Modal.jsx';
import Sidebar from './navegacion/Sidebar.jsx';
import { AccessErrorScreen, LoadingScreen, LoginScreen } from './paginas/Login/Login.jsx';
import Categories from './paginas/Categorias/Categorias.jsx';
import Dashboard from './paginas/Inicio/Inicio.jsx';
import Movements from './paginas/Movimientos/Movimientos.jsx';
import Products from './paginas/Productos/Productos.jsx';
import Reports from './paginas/Reportes/Reportes.jsx';
import Settings from './paginas/Configuracion/Configuracion.jsx';
import Suppliers from './paginas/Proveedores/Proveedores.jsx';
import { pageDescriptions } from './paginas/pageDescriptions.js';
import { authErrorMessage, isFirebaseAuthError } from './utils/authErrorMessage.js';
import { categorySlug, normalizeLabel } from './utils/categories.js';
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
function App() {
    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(() => !auth);
    const [authError, setAuthError] = useState('');
    const [authNotice, setAuthNotice] = useState('');
    const [authBusy, setAuthBusy] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [products, setProducts] = useState([]);
    const [movements, setMovements] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [categoryError, setCategoryError] = useState('');
    const [supplierError, setSupplierError] = useState('');
    const [inventoryStatus, setInventoryStatus] = useState('loading');
    const [firestoreError, setFirestoreError] = useState('');
    const [view, setView] = useState('dashboard');
    const [search, setSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [notice, setNotice] = useState('');
    const [modal, setModal] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [categorySelection, setCategorySelection] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [movementType, setMovementType] = useState('entrada');
    const [saving, setSaving] = useState(false);
    const [profileName, setProfileName] = useState('');
    const [compactView, setCompactView] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notificationRef = useRef(null);
    const productDialogRef = useRef(null);
    const productDialogOpenerRef = useRef(null);
    const [today] = useState(() => new Date());
    useEffect(() => {
        if (modal !== 'product')
            return;
        const dialog = productDialogRef.current;
        const focusableSelector = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
        const getFocusableElements = () => [...(dialog?.querySelectorAll(focusableSelector) ?? [])]
            .filter((element) => element.getAttribute('aria-hidden') !== 'true' && element.getClientRects().length > 0);
        const firstFocusable = getFocusableElements()[0];
        const firstFormControl = dialog?.querySelector('form input:not([disabled]):not([type="hidden"]),form select:not([disabled]),form textarea:not([disabled]),form button:not([disabled])');
        const heading = dialog?.querySelector('#product-modal-title');
        (firstFormControl ?? heading ?? firstFocusable ?? dialog)?.focus();
        function keepFocusInDialog(event) {
            if (!dialog)
                return;
            if (event.key === 'Escape') {
                event.preventDefault();
                setModal(null);
                return;
            }
            if (event.key !== 'Tab')
                return;
            const focusable = getFocusableElements();
            if (focusable.length === 0) {
                event.preventDefault();
                dialog.focus();
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
                event.preventDefault();
                first.focus();
            }
        }
        document.addEventListener('keydown', keepFocusInDialog);
        return () => {
            document.removeEventListener('keydown', keepFocusInDialog);
            const opener = productDialogOpenerRef.current;
            productDialogOpenerRef.current = null;
            if (opener?.isConnected) {
                window.requestAnimationFrame(() => {
                    if (opener.isConnected && !document.querySelector('.product-modal[role="dialog"]'))
                        opener.focus();
                });
            }
        };
    }, [modal]);
    useEffect(() => {
        if (!notificationsOpen)
            return;
        function closeOnOutsideClick(event) {
            if (event.target instanceof Node && !notificationRef.current?.contains(event.target)) {
                setNotificationsOpen(false);
            }
        }
        function closeOnEscape(event) {
            if (event.key === 'Escape')
                setNotificationsOpen(false);
        }
        document.addEventListener('pointerdown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('pointerdown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [notificationsOpen]);
    useEffect(() => {
        if (!auth)
            return;
        return onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setInventoryStatus('loading');
            setProducts([]);
            setMovements([]);
            setCategories([]);
            setSuppliers([]);
            setProductSearch('');
            setProfileName(currentUser?.displayName ?? '');
            if (currentUser) {
                try {
                    setCompactView(localStorage.getItem(`pasostock-compact-${currentUser.uid}`) === 'true');
                }
                catch {
                    setNotice('No se pudieron cargar las preferencias locales de visualización.');
                }
            }
            else {
                setCompactView(false);
            }
            setAuthReady(true);
        }, () => {
            setAuthError('No se pudo comprobar la sesión. Revisa tu conexión y vuelve a cargar la página.');
            setAuthReady(true);
        });
    }, []);
    useEffect(() => {
        if (!auth)
            return;
        let active = true;
        void getRedirectResult(auth).catch((error) => {
            if (!active)
                return;
            setAuthError(isFirebaseAuthError(error) ? authErrorMessage(error.code) : 'No se pudo completar el acceso con Google. Inténtalo de nuevo.');
        });
        return () => {
            active = false;
        };
    }, []);
    useEffect(() => {
        if (!user)
            return;
        return subscribeToInventory((data) => {
            setProducts(data.products);
            setMovements(data.movements);
            setInventoryStatus('ready');
            setFirestoreError('');
        }, (error) => {
            setInventoryStatus('error');
            setFirestoreError(getInventoryErrorMessage(error));
        });
    }, [user]);
    useEffect(() => {
        if (!user)
            return;
        return subscribeToCategories(setCategories, (error) => {
            setCategoryError(getInventoryErrorMessage(error));
        });
    }, [user]);
    useEffect(() => {
        if (!user)
            return;
        return subscribeToSuppliers(setSuppliers, (error) => {
            setSupplierError(getInventoryErrorMessage(error));
        });
    }, [user]);
    async function handleSignIn(event) {
        event.preventDefault();
        if (!auth)
            return;
        const form = new FormData(event.currentTarget);
        const email = String(form.get('email') ?? '').trim();
        const password = String(form.get('password') ?? '');
        const rememberSession = form.get('remember') === 'on';
        setAuthError('');
        setAuthNotice('');
        setAuthBusy(true);
        try {
            await setPersistence(auth, rememberSession ? browserLocalPersistence : browserSessionPersistence);
            await signInWithEmailAndPassword(auth, email, password);
        }
        catch (error) {
            if (isFirebaseAuthError(error)) {
                setAuthError(authErrorMessage(error.code));
            }
            else {
                setAuthError('No se pudo iniciar sesión. Revisa tu conexión e inténtalo de nuevo.');
            }
        }
        finally {
            setAuthBusy(false);
        }
    }

    async function handleRegister(event, onSuccess) {
        event.preventDefault();
        if (!auth)
            return;
        const form = new FormData(event.currentTarget);
        const name = String(form.get('name') ?? '').trim();
        const email = String(form.get('email') ?? '').trim();
        const password = String(form.get('password') ?? '');
        const passwordConfirmation = String(form.get('passwordConfirmation') ?? '');
        const rememberSession = form.get('remember') === 'on';
        setAuthError('');
        setAuthNotice('');
        if (name.length < 2 || name.length > 100) {
            setAuthError('Escribe tu nombre completo (de 2 a 100 caracteres).');
            return;
        }
        if (password !== passwordConfirmation) {
            setAuthError('Las contraseñas no coinciden.');
            return;
        }
        setAuthBusy(true);
        let accountCreated = false;
        try {
            await setPersistence(auth, rememberSession ? browserLocalPersistence : browserSessionPersistence);
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            accountCreated = true;
            let profileUpdated = true;
            try {
                await updateProfile(credential.user, { displayName: name });
            }
            catch {
                profileUpdated = false;
            }
            await signOut(auth);
            setAuthNotice(profileUpdated
                ? 'Usuario creado correctamente. Inicia sesión con tu correo y contraseña.'
                : 'Usuario creado. No se pudo guardar el nombre, pero ya puedes iniciar sesión.');
            setRegisteredEmail(email);
            onSuccess(email);
        }
        catch (error) {
            setAuthError(accountCreated
                ? 'La cuenta se creó, pero no se pudo cerrar la sesión automáticamente. Cierra sesión y luego inicia sesión con la cuenta creada.'
                : isFirebaseAuthError(error)
                    ? authErrorMessage(error.code)
                    : 'No se pudo crear la cuenta. Revisa tu conexión e inténtalo de nuevo.');
        }
        finally {
            setAuthBusy(false);
        }
    }
    async function handleGoogleSignIn(rememberSession) {
        if (!auth)
            return;
        setAuthError('');
        setAuthNotice('');
        setAuthBusy(true);
        try {
            await setPersistence(auth, rememberSession ? browserLocalPersistence : browserSessionPersistence);
            await signInWithRedirect(auth, new GoogleAuthProvider());
        }
        catch (error) {
            setAuthError(isFirebaseAuthError(error) ? authErrorMessage(error.code) : 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.');
        }
        finally {
            setAuthBusy(false);
        }
    }
    async function handlePasswordReset(email) {
        if (!auth || !email)
            return;
        setAuthError('');
        setAuthNotice('');
        setAuthBusy(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setAuthNotice('Enviamos un enlace para restablecer tu contraseña al correo indicado.');
        }
        catch (error) {
            setAuthError(isFirebaseAuthError(error) ? authErrorMessage(error.code) : 'No se pudo enviar el enlace. Revisa el correo e inténtalo de nuevo.');
        }
        finally {
            setAuthBusy(false);
        }
    }
    async function handleSignOut() {
        if (!auth)
            return;
        setAuthError('');
        try {
            await signOut(auth);
            setNotice('');
            setView('dashboard');
            setSearch('');
        }
        catch {
            setAuthError('No se pudo cerrar la sesión. Inténtalo de nuevo.');
        }
    }
    if (!authReady) {
        return _jsx("div", { className: "auth-screen", children: _jsxs("div", { className: "auth-card auth-loading", children: [_jsx("div", { className: "brand-mark", children: _jsx(Icon, { name: "leaf" }) }), _jsx("p", { children: "Comprobando sesi\u00F3n..." })] }) });
    }
    if (!user) {
        return _jsx(LoginScreen, { configured: firebaseConfigured, error: authError, notice: authNotice, busy: authBusy, initialEmail: registeredEmail, onClearMessages: () => { setAuthError(''); setAuthNotice(''); }, onSubmit: handleSignIn, onRegister: handleRegister, onGoogleSignIn: handleGoogleSignIn, onPasswordReset: handlePasswordReset });
    }
    if (inventoryStatus === 'loading') {
        return _jsx(LoadingScreen, { message: "Conectando con el inventario de Firestore..." });
    }
    if (inventoryStatus === 'error') {
        return _jsx(AccessErrorScreen, { message: firestoreError, onRetry: () => window.location.reload(), onSignOut: handleSignOut });
    }
    const lowStock = products.filter((product) => product.stock <= product.minStock);
    const totalUnits = products.reduce((sum, product) => sum + product.stock, 0);
    const displayName = profileName.trim() || user.email?.split('@')[0]?.split(/[._-]+/).filter(Boolean).map((part) => part.charAt(0).toLocaleUpperCase('es') + part.slice(1)).join(' ') || 'Usuario';
    const filteredProducts = products.filter((product) => {
        const query = productSearch.trim().toLowerCase();
        return !query || `${product.name} ${product.code} ${product.category}`.toLowerCase().includes(query);
    });
    const filteredMovements = movements.filter((movement) => {
        const query = search.trim().toLowerCase();
        return !query || `${movement.productName} ${movement.note} ${movement.type}`.toLowerCase().includes(query);
    });
    const filteredSuppliers = suppliers.filter((supplier) => {
        const query = search.trim().toLowerCase();
        return !query || `${supplier.name} ${supplier.phone} ${supplier.email} ${supplier.address}`.toLowerCase().includes(query);
    });
    const categoryRows = new Map();
    for (const category of categories) {
        categoryRows.set(category.name, { category, count: products.filter((product) => product.category === category.name).length });
    }
    for (const product of products) {
        const existing = categoryRows.get(product.category);
        if (existing)
            existing.count += categories.some((category) => category.name === product.category) ? 0 : 1;
        else
            categoryRows.set(product.category, { category: null, count: 1 });
    }
    const filteredCategories = [...categoryRows.entries()]
        .filter(([name]) => !search.trim() || name.toLowerCase().includes(search.trim().toLowerCase()))
        .sort(([a], [b]) => a.localeCompare(b, 'es'));
    function openProduct(product) {
        productDialogOpenerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setEditingProduct(product ?? null);
        setCategorySelection(product?.category ?? categories[0]?.name ?? '');
        setModal('product');
    }
    function openCategory(category) {
        setEditingCategory(category ?? null);
        setModal('category');
    }
    function openSupplier(supplier) {
        setEditingSupplier(supplier ?? null);
        setModal('supplier');
    }
    function submitProductSearch(event) {
        event.preventDefault();
        setView('products');
    }
    async function submitCategory(event) {
        event.preventDefault();
        const name = String(new FormData(event.currentTarget).get('name') ?? '').trim();
        if (!name || name.length > 80 || !/[\p{L}\p{N}]/u.test(name) || !categorySlug(name)) {
            setNotice('Escribe un nombre de categoría de hasta 80 caracteres usando letras, números o espacios.');
            return;
        }
        if (filteredCategories.some(([existingName]) => (normalizeLabel(existingName) === normalizeLabel(name)
            && existingName !== editingCategory?.name))) {
            setNotice('Ya existe una categoría con ese nombre. Puedes registrarla desde el listado.');
            return;
        }
        setSaving(true);
        try {
            if (editingCategory) {
                await updateCategory(editingCategory, name);
                setNotice('Categoría actualizada en Firestore.');
            }
            else {
                await createCategory(name);
                setNotice('Categoría creada en Firestore.');
            }
            setModal(null);
        }
        catch (error) {
            setNotice(getInventoryErrorMessage(error));
        }
        finally {
            setSaving(false);
        }
    }
    async function registerExistingCategory(name) {
        setSaving(true);
        try {
            await createCategory(name);
            setNotice(`La categoría "${name}" ya está disponible para administrarla.`);
        }
        catch (error) {
            setNotice(getInventoryErrorMessage(error));
        }
        finally {
            setSaving(false);
        }
    }
    async function handleDeleteCategory(category) {
        if (products.some((product) => product.category === category.name)) {
            setNotice('No se puede eliminar una categoría que todavía usan productos.');
            return;
        }
        if (!window.confirm(`¿Eliminar la categoría "${category.name}"?`))
            return;
        try {
            await deleteCategory(category);
            setNotice('Categoría eliminada de Firestore.');
        }
        catch (error) {
            setNotice(getInventoryErrorMessage(error));
        }
    }
    async function submitSupplier(event) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const supplier = {
            name: String(form.get('name') ?? '').trim(),
            phone: String(form.get('phone') ?? '').trim(),
            email: String(form.get('email') ?? '').trim(),
            address: String(form.get('address') ?? '').trim(),
        };
        if (!supplier.name || supplier.name.length > 100 || supplier.phone.length > 40 || supplier.email.length > 120 || supplier.address.length > 240) {
            setNotice('Revisa el nombre y la longitud de los datos del proveedor.');
            return;
        }
        setSaving(true);
        try {
            if (editingSupplier) {
                await updateSupplier({ ...editingSupplier, ...supplier });
                setNotice('Proveedor actualizado en Firestore.');
            }
            else {
                await createSupplier(supplier);
                setNotice('Proveedor guardado en Firestore.');
            }
            setModal(null);
        }
        catch (error) {
            setNotice(getInventoryErrorMessage(error));
        }
        finally {
            setSaving(false);
        }
    }
    async function handleDeleteSupplier(supplier) {
        if (!window.confirm(`¿Eliminar el proveedor "${supplier.name}"?`))
            return;
        try {
            await deleteSupplier(supplier);
            setNotice('Proveedor eliminado de Firestore.');
        }
        catch (error) {
            setNotice(getInventoryErrorMessage(error));
        }
    }
    async function submitSettings(event) {
        event.preventDefault();
        const signedInUser = user;
        if (!signedInUser)
            return;
        const form = new FormData(event.currentTarget);
        const name = String(form.get('displayName') ?? '').trim();
        const compact = form.get('compactView') === 'on';
        if (!name || name.length > 80) {
            setNotice('El nombre del perfil es obligatorio y debe tener máximo 80 caracteres.');
            return;
        }
        setSaving(true);
        try {
            await updateProfile(signedInUser, { displayName: name });
            setProfileName(name);
        }
        catch {
            setNotice('No se pudo actualizar el perfil en Firebase Authentication.');
            setSaving(false);
            return;
        }
        try {
            localStorage.setItem(`pasostock-compact-${signedInUser.uid}`, String(compact));
            setCompactView(compact);
            setNotice('Perfil y preferencias actualizados.');
        }
        catch {
            setNotice('El perfil se actualizó, pero el navegador no pudo guardar la preferencia visual.');
        }
        finally {
            setSaving(false);
        }
    }
    async function submitProduct(event) {
        event.preventDefault();
        const signedInUser = user;
        if (!signedInUser)
            return;
        const form = new FormData(event.currentTarget);
        const name = String(form.get('name') ?? '').trim();
        const code = editingProduct?.code ?? String(form.get('code') ?? '').trim().toUpperCase();
        const category = String(form.get('category') ?? '').trim();
        const rawPrice = String(form.get('price') ?? '').trim();
        const price = Number(rawPrice);
        const unit = String(form.get('unit') ?? '').trim();
        const minStock = Number(form.get('minStock'));
        const initialStock = Number(form.get('stock'));
        if (!category || (category !== editingProduct?.category && !categories.some((existing) => existing.name === category))) {
            setNotice('Selecciona una categoría existente. Puedes crearla desde el módulo Categorías.');
            return;
        }
        if (!name || !code || !unit || !Number.isInteger(minStock) || minStock < 0) {
            setNotice('Completa todos los campos y revisa que el mínimo sea un número entero no negativo.');
            return;
        }
        if (!/^\d{1,9}(?:\.\d{1,2})?$/.test(rawPrice) || !Number.isFinite(price) || price < 0 || price > 999999999) {
            setNotice('Ingresa un precio válido de hasta dos decimales y no mayor a 999.999.999.');
            return;
        }
        if (!editingProduct && !/^[A-Z0-9_-]{1,40}$/.test(code)) {
            setNotice('El código debe tener solo letras, números, guiones o guiones bajos (máximo 40 caracteres).');
            return;
        }
        if (products.some((product) => product.code.toLowerCase() === code.toLowerCase() && product.id !== editingProduct?.id)) {
            setNotice('Ya existe un producto con ese código.');
            return;
        }
        if (!editingProduct && (!Number.isInteger(initialStock) || initialStock < 0)) {
            setNotice('El stock inicial debe ser un número entero no negativo.');
            return;
        }
        setSaving(true);
        try {
            if (editingProduct) {
                await updateProduct({ ...editingProduct, name, category, price, unit, minStock });
                setNotice('Producto actualizado en Firestore.');
            }
            else {
                await createProduct({ code, name, category, price, unit, stock: initialStock, minStock }, signedInUser.uid);
                setNotice('Producto registrado en Firestore.');
            }
            setModal(null);
        }
        catch (error) {
            setNotice(getInventoryErrorMessage(error));
        }
        finally {
            setSaving(false);
        }
    }
    async function handleDeleteProduct(product) {
        if (movements.some((movement) => movement.productId === product.id)) {
            setNotice('No se puede eliminar este producto porque tiene movimientos asociados.');
            return;
        }
        if (!window.confirm(`¿Eliminar "${product.name}" del inventario?`))
            return;
        try {
            await deleteProduct(product);
            setNotice('Producto eliminado de Firestore.');
        }
        catch (error) {
            setNotice(getInventoryErrorMessage(error));
        }
    }
    async function submitMovement(event) {
        event.preventDefault();
        const signedInUser = user;
        if (!signedInUser)
            return;
        const form = new FormData(event.currentTarget);
        const productId = String(form.get('productId') ?? '');
        const quantity = Number(form.get('quantity'));
        const note = String(form.get('note') ?? '').trim();
        const product = products.find((item) => item.id === productId);
        if (!product || !Number.isInteger(quantity) || quantity <= 0) {
            setNotice('Selecciona un producto e ingresa una cantidad entera mayor que cero.');
            return;
        }
        setSaving(true);
        try {
            await registerMovement(product.id, movementType, quantity, note, signedInUser.uid);
            setModal(null);
            setNotice(`Se registró la ${movementType} de ${quantity} ${product.unit} en Firestore.`);
        }
        catch (error) {
            setNotice(getInventoryErrorMessage(error));
        }
        finally {
            setSaving(false);
        }
    }
    function exportReport() {
        const rows = [
            ['Código', 'Producto', 'Categoría', 'Existencias', 'Unidad', 'Stock mínimo', 'Estado'],
            ...products.map((product) => [
                product.code,
                product.name,
                product.category,
                String(product.stock),
                product.unit,
                String(product.minStock),
                product.stock <= product.minStock ? 'Stock bajo' : 'Disponible',
            ]),
        ];
        const csv = `\uFEFF${rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(';')).join('\r\n')}`;
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'reporte-inventario.csv';
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setNotice('Reporte de inventario descargado.');
    }
    const titles = {
        dashboard: 'Inicio',
        products: 'Catálogo de Productos',
        movements: 'Movimientos',
        categories: 'Categorías',
        suppliers: 'Proveedores',
        reports: 'Reportes',
        settings: 'Configuración',
    };
    return (_jsxs("div", { className: `app-shell${compactView ? ' compact-view' : ''}`, children: [_jsx(Sidebar, { view, lowStock, profileName, user, handleSignOut, onNavigate: (key) => { setView(key); setSearch(''); } }), _jsxs("main", { className: "main-area", children: [_jsxs("header", { className: "topbar", children: [view === 'dashboard' && _jsxs("form", { className: "top-search search-box", role: "search", onSubmit: submitProductSearch, children: [_jsx(Icon, { name: "search" }), _jsx("input", { type: "search", "aria-label": "Buscar productos por nombre, c\u00F3digo o categor\u00EDa", value: productSearch, onChange: (event) => setProductSearch(event.target.value), placeholder: "Buscar productos..." }), _jsx("button", { type: "submit", className: "top-search-submit", "aria-label": "Buscar productos", children: _jsx(Icon, { name: "arrowRight" }) })] }), _jsxs("div", { className: "top-actions", children: [_jsx("span", { className: "today-date", children: new Intl.DateTimeFormat('es-EC', { dateStyle: 'long' }).format(today) }), _jsxs("div", { className: "notification-menu", ref: notificationRef, children: [_jsxs("button", { type: "button", className: `icon-button notification-button${lowStock.length > 0 ? ' has-alerts' : ''}`, "aria-label": lowStock.length > 0 ? `Notificaciones, ${lowStock.length} alertas activas` : 'Notificaciones', "aria-haspopup": "true", "aria-expanded": notificationsOpen, "aria-controls": "notification-panel", onClick: () => setNotificationsOpen((open) => !open), children: [_jsx(Icon, { name: "bell" }), lowStock.length > 0 && _jsx("span", { className: "notification-indicator", "aria-hidden": "true", children: lowStock.length > 9 ? '9+' : lowStock.length })] }), notificationsOpen && (_jsxs("section", { id: "notification-panel", className: "notification-panel", "aria-label": "Notificaciones", children: [_jsxs("div", { className: "notification-panel-header", children: [_jsxs("div", { children: [_jsx("h2", { children: "Notificaciones" }), _jsx("p", { children: lowStock.length > 0 ? 'Revisa los productos que necesitan atención.' : 'El estado de tu inventario está actualizado.' })] }), _jsx("span", { className: `notification-total${lowStock.length > 0 ? ' has-alerts' : ''}`, children: lowStock.length })] }), lowStock.length > 0
                                                        ? _jsx("ul", { className: "notification-list", children: lowStock.map((product) => (_jsx("li", { children: _jsxs("button", { type: "button", className: "notification-item", onClick: () => {
                                                                        setProductSearch(product.name);
                                                                        setSearch('');
                                                                        setView('products');
                                                                        setNotificationsOpen(false);
                                                                    }, children: [_jsx("span", { className: "notification-item-icon", children: _jsx(Icon, { name: "bell" }) }), _jsxs("span", { className: "notification-item-copy", children: [_jsxs("strong", { children: ["Stock bajo: ", product.name] }), _jsxs("small", { children: [product.stock, " ", product.unit, " disponibles \u00B7 m\u00EDnimo ", product.minStock, " ", product.unit] })] }), _jsx(Icon, { name: "arrowRight" })] }) }, product.id))) })
                                                        : _jsxs("div", { className: "notification-empty", children: [_jsx("span", { className: "notification-empty-icon", children: _jsx(Icon, { name: "check" }) }), _jsx("strong", { children: "No tienes alertas" }), _jsx("p", { children: "Las alertas de stock aparecer\u00E1n aqu\u00ED cuando un producto llegue a su m\u00EDnimo." })] })] }))] }), _jsx("div", { className: "top-avatar", "aria-hidden": "true", children: displayName.slice(0, 1).toUpperCase() }), _jsx("span", { className: "top-user-name", children: displayName })] })] }), _jsxs("div", { className: "content", children: [notice && _jsxs("div", { className: "toast", role: "status", children: [notice, _jsx("button", { "aria-label": "Cerrar aviso", onClick: () => setNotice(''), children: _jsx(Icon, { name: "close" }) })] }), _jsxs("div", { className: "page-heading", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "GESTI\u00D3N DE EXISTENCIAS" }), _jsx("h1", { children: view === 'dashboard' ? `¡Hola, ${displayName}!` : titles[view] }), _jsx("p", { className: "page-subtitle", children: view === 'dashboard' ? 'Resumen de la actividad y el estado actual de tu inventario.' : pageDescriptions[view] })] }), _jsxs("div", { className: `heading-actions ${view === 'dashboard' ? 'dashboard-heading-actions' : ''}`, children: [['movements', 'categories', 'suppliers'].includes(view) && _jsxs("div", { className: "search-box", children: [_jsx(Icon, { name: "search" }), _jsx("input", { value: search, onChange: (event) => setSearch(event.target.value), placeholder: view === 'movements' ? 'Buscar movimiento...' : view === 'categories' ? 'Buscar categoría...' : 'Buscar proveedor...' })] }), view === 'dashboard' && _jsxs(_Fragment, { children: [_jsxs("button", { className: "button button-primary", onClick: () => { setMovementType('entrada'); setModal('movement'); }, children: [_jsx(Icon, { name: "plus" }), "Registrar movimiento"] }), _jsxs("button", { className: "button button-primary", onClick: () => openProduct(), children: [_jsx(Icon, { name: "plus" }), "Nuevo producto"] })] }), view === 'products' && _jsxs("button", { className: "button button-primary", onClick: () => openProduct(), children: [_jsx(Icon, { name: "plus" }), "Nuevo Producto"] }), view === 'movements' && _jsxs("button", { className: "button button-primary", onClick: () => { setMovementType('entrada'); setModal('movement'); }, children: [_jsx(Icon, { name: "plus" }), "Nuevo movimiento"] }), view === 'categories' && _jsxs("button", { className: "button button-primary", onClick: () => openCategory(), children: [_jsx(Icon, { name: "plus" }), "Nueva categor\u00EDa"] }), view === 'suppliers' && _jsxs("button", { className: "button button-primary", onClick: () => openSupplier(), children: [_jsx(Icon, { name: "plus" }), "Nuevo proveedor"] }), view === 'reports' && _jsxs("button", { className: "button button-primary", onClick: exportReport, children: [_jsx(Icon, { name: "download" }), "Exportar CSV"] })] })] }), view === 'products' && _jsxs("form", { className: "products-search search-box", role: "search", onSubmit: submitProductSearch, children: [_jsx(Icon, { name: "search" }), _jsx("input", { type: "search", "aria-label": "Buscar productos por nombre, c\u00F3digo o categor\u00EDa", value: productSearch, onChange: (event) => setProductSearch(event.target.value), placeholder: "Buscar por nombre o categor\u00EDa..." }), _jsx("button", { type: "submit", className: "top-search-submit", "aria-label": "Buscar productos", children: _jsx(Icon, { name: "arrowRight" }) })] }), view === 'dashboard' && _jsx(Dashboard, { products: products, movements: movements, lowStock: lowStock, totalUnits: totalUnits, onProducts: () => setView('products'), onMovements: () => setView('movements') }), view === 'products' && _jsx(Products, { products: filteredProducts, hasSearch: Boolean(productSearch.trim()), onEdit: openProduct, onDelete: handleDeleteProduct }), view === 'movements' && _jsx(Movements, { movements: filteredMovements, onNew: (type) => { setMovementType(type); setModal('movement'); } }), view === 'categories' && _jsx(Categories, { categories: filteredCategories, error: categoryError, saving: saving, onEdit: openCategory, onRegister: registerExistingCategory, onDelete: handleDeleteCategory }), view === 'suppliers' && _jsx(Suppliers, { suppliers: filteredSuppliers, error: supplierError, onEdit: openSupplier, onDelete: handleDeleteSupplier }), view === 'reports' && _jsx(Reports, { products: products, movements: movements, lowStock: lowStock, onExport: exportReport }), view === 'settings' && _jsx(Settings, { user: user, profileName: profileName, compactView: compactView, saving: saving, onSubmit: submitSettings }), _jsxs("footer", { className: "footer", children: [_jsx("span", { children: "\u00A9 2026 PasoStock" }), _jsx("span", { children: "Prototipo acad\u00E9mico \u00B7 Sistema de control de inventario" })] })] })] }), modal === 'product' && _jsx(Modal, { className: "product-modal-backdrop", onClose: () => setModal(null), children: _jsxs("section", { ref: productDialogRef, className: "modal product-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "product-modal-title", "aria-describedby": "product-modal-description", tabIndex: -1, children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: editingProduct ? 'ACTUALIZAR INFORMACIÓN' : 'AÑADIR AL INVENTARIO' }), _jsx("h2", { id: "product-modal-title", children: editingProduct ? 'Editar Producto' : 'Nuevo Producto' }), _jsx("p", { className: "product-modal-description", id: "product-modal-description", children: editingProduct ? 'Actualiza los datos de este producto.' : 'Completa los datos para agregarlo al catálogo.' })] }), _jsx("button", { className: "icon-button", "aria-label": "Cerrar", onClick: () => setModal(null), children: _jsx(Icon, { name: "close" }) })] }), _jsxs("form", { onSubmit: submitProduct, className: "form-grid", children: [_jsxs("label", { className: "field full-field", children: ["Nombre del producto", _jsx("input", { name: "name", required: true, defaultValue: editingProduct?.name ?? '', placeholder: "Ej. Comino molido" })] }), _jsxs("label", { className: "field", children: ["Categor\u00EDa", _jsxs("select", { name: "category", required: true, value: categorySelection, onChange: (event) => setCategorySelection(event.target.value), children: [_jsx("option", { value: "", disabled: true, children: categories.length ? 'Selecciona una categoría…' : 'No hay categorías disponibles' }), categories.map((category) => _jsx("option", { value: category.name, children: category.name }, category.id)), editingProduct && !categories.some((category) => category.name === editingProduct.category) && _jsxs("option", { value: editingProduct.category, children: [editingProduct.category, " (actual)"] })] }), !editingProduct && categories.length === 0 && _jsx("small", { children: "Crea una categor\u00EDa desde el m\u00F3dulo Categor\u00EDas antes de registrar productos." })] }), _jsxs("label", { className: "field", children: ["Precio ($)", _jsx("input", { name: "price", type: "number", min: "0", max: "999999999", step: "0.01", required: true, defaultValue: editingProduct?.price ?? '0.00', placeholder: "0.00" })] }), _jsxs("label", { className: "field", children: ["C\u00F3digo", _jsx("input", { name: "code", required: true, disabled: Boolean(editingProduct), defaultValue: editingProduct?.code ?? '', placeholder: "Ej. ESP-001" }), _jsx("small", { children: "Identificador permanente del producto." })] }), _jsxs("label", { className: "field", children: ["Unidad de medida", _jsx("input", { name: "unit", required: true, defaultValue: editingProduct?.unit ?? '', placeholder: "Ej. unidad, kg, lb" })] }), _jsxs("fieldset", { className: "stock-fields full-field", "aria-describedby": "stock-fields-hint", children: [_jsx("legend", { children: "Existencias y reposici\u00F3n" }), _jsx("p", { id: "stock-fields-hint", children: "Define el inventario disponible y el nivel m\u00EDnimo." }), !editingProduct && _jsxs("label", { className: "field", children: ["Stock inicial", _jsx("input", { name: "stock", type: "number", min: "0", step: "1", required: true, defaultValue: "0" }), _jsx("small", { children: "Se registrar\u00E1 como una entrada inicial." })] }), _jsxs("label", { className: "field", children: ["Stock m\u00EDnimo", _jsx("input", { name: "minStock", type: "number", min: "0", step: "1", required: true, defaultValue: editingProduct?.minStock ?? 5 })] })] }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { type: "button", className: "button button-plain", onClick: () => setModal(null), children: "Cancelar" }), _jsx("button", { className: "button button-primary", disabled: saving, children: saving ? 'Guardando...' : 'Guardar' })] })] })] }) }), modal === 'movement' && _jsx(Modal, { onClose: () => setModal(null), children: _jsxs("section", { className: "modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "movement-modal-title", children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "CONTROL DE EXISTENCIAS" }), _jsx("h2", { id: "movement-modal-title", children: "Registrar movimiento" })] }), _jsx("button", { className: "icon-button", "aria-label": "Cerrar", onClick: () => setModal(null), children: _jsx(Icon, { name: "close" }) })] }), _jsxs("form", { onSubmit: submitMovement, className: "form-grid", children: [_jsxs("label", { className: "field full-field", children: ["Tipo de movimiento", _jsxs("select", { value: movementType, onChange: (event) => setMovementType(event.target.value), children: [_jsx("option", { value: "entrada", children: "Entrada de mercader\u00EDa" }), _jsx("option", { value: "salida", children: "Salida de mercader\u00EDa" })] })] }), _jsxs("label", { className: "field full-field", children: ["Producto", _jsxs("select", { name: "productId", required: true, defaultValue: "", children: [_jsx("option", { value: "", disabled: true, children: "Selecciona un producto" }), products.map((product) => _jsxs("option", { value: product.id, children: [product.name, " \u00B7 ", product.stock, " ", product.unit, " disponibles"] }, product.id))] })] }), _jsxs("label", { className: "field full-field", children: ["Cantidad", _jsx("input", { name: "quantity", type: "number", min: "1", step: "1", required: true, placeholder: "Ej. 10" })] }), _jsxs("label", { className: "field full-field", children: ["Nota ", _jsx("span", { className: "optional", children: "(opcional)" }), _jsx("input", { name: "note", maxLength: 120, placeholder: "Ej. Reposici\u00F3n de proveedor" })] }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { type: "button", className: "button button-plain", onClick: () => setModal(null), children: "Cancelar" }), _jsx("button", { className: "button button-primary", disabled: saving, children: saving ? 'Guardando...' : `Confirmar ${movementType}` })] })] })] }) }), modal === 'category' && _jsx(Modal, { onClose: () => setModal(null), children: _jsxs("section", { className: "modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "category-modal-title", children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "ORGANIZA TUS PRODUCTOS" }), _jsx("h2", { id: "category-modal-title", children: editingCategory ? 'Editar categoría' : 'Nueva categoría' })] }), _jsx("button", { className: "icon-button", "aria-label": "Cerrar", onClick: () => setModal(null), children: _jsx(Icon, { name: "close" }) })] }), _jsxs("form", { onSubmit: submitCategory, className: "form-grid", children: [_jsxs("label", { className: "field full-field", children: ["Nombre de la categor\u00EDa", _jsx("input", { name: "name", required: true, maxLength: 80, defaultValue: editingCategory?.name ?? '', placeholder: "Ej. Especias" })] }), editingCategory && _jsx("p", { className: "form-hint full-field", children: "Los productos que usan esta categor\u00EDa se actualizar\u00E1n autom\u00E1ticamente." }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { type: "button", className: "button button-plain", onClick: () => setModal(null), children: "Cancelar" }), _jsx("button", { className: "button button-primary", disabled: saving, children: saving ? 'Guardando...' : editingCategory ? 'Guardar cambios' : 'Crear categoría' })] })] })] }) }), modal === 'supplier' && _jsx(Modal, { onClose: () => setModal(null), children: _jsxs("section", { className: "modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "supplier-modal-title", children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "DIRECTORIO DE CONTACTOS" }), _jsx("h2", { id: "supplier-modal-title", children: editingSupplier ? 'Editar proveedor' : 'Nuevo proveedor' })] }), _jsx("button", { className: "icon-button", "aria-label": "Cerrar", onClick: () => setModal(null), children: _jsx(Icon, { name: "close" }) })] }), _jsxs("form", { onSubmit: submitSupplier, className: "form-grid", children: [_jsxs("label", { className: "field full-field", children: ["Nombre del proveedor", _jsx("input", { name: "name", required: true, maxLength: 100, defaultValue: editingSupplier?.name ?? '', placeholder: "Ej. Distribuidora Central" })] }), _jsxs("label", { className: "field", children: ["Tel\u00E9fono", _jsx("input", { name: "phone", type: "tel", maxLength: 40, defaultValue: editingSupplier?.phone ?? '', placeholder: "Ej. 099 123 4567" })] }), _jsxs("label", { className: "field", children: ["Correo electr\u00F3nico", _jsx("input", { name: "email", type: "email", maxLength: 120, defaultValue: editingSupplier?.email ?? '', placeholder: "contacto@proveedor.com" })] }), _jsxs("label", { className: "field full-field", children: ["Direcci\u00F3n", _jsx("input", { name: "address", maxLength: 240, defaultValue: editingSupplier?.address ?? '', placeholder: "Ciudad, calle y referencia" })] }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { type: "button", className: "button button-plain", onClick: () => setModal(null), children: "Cancelar" }), _jsx("button", { className: "button button-primary", disabled: saving, children: saving ? 'Guardando...' : editingSupplier ? 'Guardar cambios' : 'Guardar proveedor' })] })] })] }) })] }));
}






export default App;
