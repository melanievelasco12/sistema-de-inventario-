import { collection, doc, onSnapshot, orderBy, query, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
function requireDb() {
    if (!db)
        throw new Error('Firebase no está configurado. Revisa las variables VITE_FIREBASE_* en .env.local.');
    return db;
}
function organizationPath(collectionName) {
    const uid = auth?.currentUser?.uid;
    if (!uid)
        throw new Error('Debes iniciar sesión para acceder a tu inventario.');
    return `organizations/${uid}/${collectionName}`;
}
export function subscribeToInventory(onChange, onError) {
    const database = requireDb();
    const productsRef = query(collection(database, organizationPath('products')), orderBy('name'));
    const movementsRef = query(collection(database, organizationPath('movements')), orderBy('createdAt', 'desc'));
    let products;
    let movements;
    let productsUnsubscribe = () => undefined;
    let movementsUnsubscribe = () => undefined;
    let stopped = false;
    const stop = () => {
        if (stopped)
            return;
        stopped = true;
        productsUnsubscribe();
        movementsUnsubscribe();
    };
    productsUnsubscribe = onSnapshot(productsRef, (snapshot) => {
        try {
            products = snapshot.docs.map((item) => readProduct(item.id, item.data({ serverTimestamps: 'estimate' })));
            if (movements)
                onChange({ products, movements });
        }
        catch (error) {
            stop();
            onError(toError(error));
        }
    }, (error) => {
        stop();
        onError(error);
    });
    movementsUnsubscribe = onSnapshot(movementsRef, (snapshot) => {
        try {
            movements = snapshot.docs.map((item) => readMovement(item.id, item.data({ serverTimestamps: 'estimate' })));
            if (products)
                onChange({ products, movements });
        }
        catch (error) {
            stop();
            onError(toError(error));
        }
    }, (error) => {
        stop();
        onError(error);
    });
    return stop;
}
export function subscribeToCategories(onChange, onError) {
    const categoriesRef = query(collection(requireDb(), organizationPath('categories')), orderBy('name'));
    return onSnapshot(categoriesRef, (snapshot) => {
        try {
            onChange(snapshot.docs.map((item) => readCategory(item.id, item.data({ serverTimestamps: 'estimate' }))));
        }
        catch (error) {
            onError(toError(error));
        }
    }, onError);
}
export async function createProduct(input, uid) {
    const database = requireDb();
    const productCode = input.code.trim().toUpperCase();
    const productRef = productCode
        ? doc(database, organizationPath(`products/${productCode}`))
        : doc(collection(database, organizationPath('products')));
    const productId = productRef.id;
    const categoryRef = doc(database, organizationPath(`categories/${categoryDocumentId(input.category)}`));
    const movementRef = input.stock > 0
        ? doc(collection(database, organizationPath('movements')))
        : null;
    await runTransaction(database, async (transaction) => {
        const existing = await transaction.get(productRef);
        const categorySnapshot = await transaction.get(categoryRef);
        if (existing.exists())
            throw new InventoryError('duplicate-code');
        const categoryName = categorySnapshot.exists() ? categorySnapshot.data().name : input.category.trim();
        if (!categorySnapshot.exists()) {
            transaction.set(categoryRef, {
                name: categoryName,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }
        transaction.set(productRef, {
            code: productCode,
            name: input.name,
            brand: input.brand,
            category: categoryName,
            price: input.price,
            unit: input.unit,
            stock: input.stock,
            minStock: input.minStock,
            movementCount: movementRef ? 1 : 0,
            lastMovementId: movementRef?.id ?? null,
            updatedAt: serverTimestamp(),
        });
        if (movementRef) {
            transaction.set(movementRef, {
                productId,
                productName: input.name,
                type: 'entrada',
                quantity: input.stock,
                note: 'Stock inicial',
                createdAt: serverTimestamp(),
                createdBy: uid,
            });
        }
    });
}
export async function updateProduct(product) {
    const database = requireDb();
    const productRef = doc(database, organizationPath(`products/${product.id}`));
    const categoryRef = doc(database, organizationPath(`categories/${categoryDocumentId(product.category)}`));
    await runTransaction(database, async (transaction) => {
        const snapshot = await transaction.get(productRef);
        const categorySnapshot = await transaction.get(categoryRef);
        if (!snapshot.exists())
            throw new InventoryError('product-not-found');
        const categoryName = categorySnapshot.exists() ? categorySnapshot.data().name : product.category.trim();
        if (!categorySnapshot.exists()) {
            transaction.set(categoryRef, {
                name: categoryName,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }
        transaction.update(productRef, {
            name: product.name,
            brand: product.brand,
            category: categoryName,
            price: product.price,
            unit: product.unit,
            minStock: product.minStock,
            updatedAt: serverTimestamp(),
        });
    });
}
export async function deleteProduct(product) {
    const database = requireDb();
    const productRef = doc(database, organizationPath(`products/${product.id}`));
    await runTransaction(database, async (transaction) => {
        const snapshot = await transaction.get(productRef);
        if (!snapshot.exists())
            throw new InventoryError('product-not-found');
        const current = snapshot.data();
        if (current.movementCount !== 0 || current.stock !== 0) {
            throw new InventoryError('product-has-movements');
        }
        transaction.delete(productRef);
    });
}
export async function registerMovement(productId, type, quantity, note, uid) {
    const database = requireDb();
    const productRef = doc(database, organizationPath(`products/${productId}`));
    const movementRef = doc(collection(database, organizationPath('movements')));
    await runTransaction(database, async (transaction) => {
        const snapshot = await transaction.get(productRef);
        if (!snapshot.exists())
            throw new InventoryError('product-not-found');
        const product = readProduct(snapshot.id, snapshot.data());
        if (!Number.isInteger(quantity) || quantity <= 0)
            throw new InventoryError('invalid-quantity');
        if (type === 'salida' && quantity > product.stock)
            throw new InventoryError('insufficient-stock');
        const stock = type === 'entrada' ? product.stock + quantity : product.stock - quantity;
        transaction.update(productRef, {
            stock,
            movementCount: product.movementCount + 1,
            lastMovementId: movementRef.id,
            updatedAt: serverTimestamp(),
        });
        transaction.set(movementRef, {
            productId,
            productName: product.name,
            type,
            quantity,
            note,
            createdAt: serverTimestamp(),
            createdBy: uid,
        });
    });
}
export function getInventoryErrorMessage(error) {
    if (error instanceof InventoryError) {
        if (error.code === 'duplicate-code')
            return 'Ya existe un producto con ese código.';
        if (error.code === 'product-not-found')
            return 'El producto ya no existe. Actualiza la lista e inténtalo de nuevo.';
        if (error.code === 'product-has-movements')
            return 'No se puede eliminar un producto que tiene existencias o movimientos en su historial.';
        if (error.code === 'invalid-quantity')
            return 'La cantidad debe ser un número entero mayor que cero.';
        if (error.code === 'insufficient-stock')
            return 'No hay existencias suficientes para registrar esa salida.';
    }
    const code = typeof error === 'object' && error !== null && 'code' in error
        ? String(error.code)
        : '';
    if (code === 'permission-denied')
        return 'Firebase rechazó la operación. Revisa que hayas iniciado sesión y que estén publicadas las reglas actualizadas de Firestore.';
    if (code === 'unavailable' || code === 'network-request-failed')
        return 'No se pudo conectar con Firebase. Revisa tu conexión e inténtalo de nuevo.';
    if (code === 'failed-precondition')
        return 'Firestore requiere una configuración adicional. Revisa el mensaje de error en la consola de Firebase.';
    return error instanceof Error ? error.message : 'Ocurrió un error inesperado al guardar los datos en Firebase.';
}
function readProduct(id, data) {
    if (typeof data.code !== 'string'
        || typeof data.name !== 'string'
        || (data.brand !== undefined && (typeof data.brand !== 'string' || data.brand.length > 80))
        || typeof data.category !== 'string'
        || (data.price !== undefined && !isNonNegativePrice(data.price))
        || typeof data.unit !== 'string'
        || !isNonNegativeInteger(data.stock)
        || !isNonNegativeInteger(data.minStock)
        || !isNonNegativeInteger(data.movementCount)
        || !(data.lastMovementId === null || typeof data.lastMovementId === 'string')) {
        throw new Error(`El producto ${id} contiene datos incompletos o inválidos en Firestore.`);
    }
    return {
        id,
        code: data.code,
        name: data.name,
        brand: data.brand ?? '',
        category: data.category,
        price: data.price === undefined ? 0 : data.price,
        unit: data.unit,
        stock: data.stock,
        minStock: data.minStock,
        movementCount: data.movementCount,
        lastMovementId: data.lastMovementId,
        updatedAt: toIsoString(data.updatedAt),
    };
}
function readCategory(id, data) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
        throw new Error(`La categoría ${id} contiene datos incompletos o inválidos en Firestore.`);
    }
    return { id, name: data.name, createdAt: toIsoString(data.createdAt) };
}
function categoryDocumentId(name) {
    const slug = name.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return slug || `category-${Array.from(name.trim()).map((character) => character.codePointAt(0)?.toString(16)).join('-')}`;
}
function readMovement(id, data) {
    if (typeof data.productId !== 'string'
        || typeof data.productName !== 'string'
        || (data.type !== 'entrada' && data.type !== 'salida')
        || !isNonNegativeInteger(data.quantity)
        || data.quantity === 0
        || typeof data.note !== 'string'
        || typeof data.createdBy !== 'string') {
        throw new Error(`El movimiento ${id} contiene datos incompletos o inválidos en Firestore.`);
    }
    return {
        id,
        productId: data.productId,
        productName: data.productName,
        type: data.type,
        quantity: data.quantity,
        note: data.note,
        createdBy: data.createdBy,
        createdAt: toIsoString(data.createdAt),
    };
}
function isNonNegativeInteger(value) {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}
function isNonNegativePrice(value) {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 999999999;
}
function toIsoString(value) {
    if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
        return value.toDate().toISOString();
    }
    throw new Error('Se encontró un registro con fecha inválida en Firestore.');
}
function toError(value) {
    return value instanceof Error ? value : new Error(String(value));
}
class InventoryError extends Error {
    code;
    constructor(code) {
        super(code);
        this.code = code;
    }
}
