# Sistema de inventario — PASO STROCK

Aplicación web de control de existencias con React, JavaScript/JSX, Firebase Authentication y Cloud Firestore.

## Estructura del proyecto

```text
sistema-inventario/
├── public/                 Recursos estáticos publicados tal cual
├── src/
│   ├── App.jsx              Coordinación de sesión, navegación y acciones
│   ├── main.jsx             Arranque de React
│   ├── componentes/         Componentes reutilizables (Button, Modal, Table)
│   ├── config/              Firebase y operaciones de Firestore
│   ├── navegacion/           Menú y navegación
│   ├── paginas/              Pantallas del sistema, agrupadas por módulo
│   ├── estilos/              Estilos globales, de página y adaptables
│   └── utils/               Formatos, categorías y mensajes de autenticación
├── firestore.rules          Reglas de acceso de Firestore
├── index.html               Entrada HTML de Vite
├── package.json             Dependencias y comandos
└── vite.config.js           Configuración de Vite
```

Las pantallas adicionales de categorías, proveedores y configuración se conservan dentro de `src/paginas/`. Los estilos siguen siendo CSS global: varias pantallas comparten clases, así que convertirlos a CSS Modules solo por cambiar el nombre podría ocultar esos estilos.

`dist/` se genera al compilar para el hosting y `node_modules/` contiene dependencias locales; no se editan manualmente ni se suben como código fuente.

## Iniciar en Windows

Requiere Node.js 20.19+ o 22.12+.

Desde la carpeta `PROYETCTO` del workspace, entra primero en la carpeta de la aplicación:

```powershell
cd .\sistema-inventario
npm.cmd install
npm.cmd run dev
```

La configuración local de Firebase se lee desde `.env.local`, excluido de Git. Copia `.env.example` a `.env.local` y completa `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` y `VITE_FIREBASE_APP_ID` con los datos de tu aplicación web de Firebase. Reinicia Vite después de editarlas.

## Configuración requerida en Firebase Console

1. **Authentication → Sign-in method**: activa Google y, si se usará, Email/Password.
2. **Authentication → Settings → Authorized domains**: incluye `localhost` y `127.0.0.1` para desarrollo. Agrega también el dominio final al desplegar.
3. El formulario **Crear cuenta** registra correo y contraseña en Firebase Authentication. En la consola de Firebase basta con habilitar el proveedor **Email/Password**; no requiere una base de datos adicional para guardar credenciales.
4. **Firestore Database**: crea la base de datos y publica el contenido actualizado de `firestore.rules` en **Reglas → Publicar**.
5. Inicia sesión o crea una cuenta. Tras registrarse, el usuario vuelve al login para ingresar con su correo y contraseña. Cada cuenta autenticada tendrá un inventario privado y separado, identificado por su UID; una cuenta nueva empieza vacía y no necesita aprobación.

Es obligatorio publicar las nuevas `firestore.rules`. Las reglas permiten a cada usuario autenticado leer y modificar únicamente los datos bajo su propio UID; no permiten que un usuario consulte el inventario de otra cuenta.

Los datos que ya estaban en `organizations/senor-de-los-alinos` se dejan intactos y no se migran automáticamente. La aplicación nueva usa `organizations/<UID-del-usuario>/...`; por eso las cuentas empiezan vacías.

## Datos y seguridad

- Productos por usuario: `organizations/<UID>/products`.
- Categorías por usuario: `organizations/<UID>/categories`.
- Los productos guardan una marca opcional; al escribir una categoría nueva en el formulario de producto, se registra en Firestore junto con el producto.
- Movimientos por usuario: `organizations/<UID>/movements`.
- Las categorías se guardan en Firestore y se pueden elegir o crear desde el formulario de productos.
- **Configuración** permite actualizar el nombre visible de Firebase Authentication y guardar la vista compacta localmente en el navegador.
- Las entradas y salidas se registran mediante transacciones de Firestore que actualizan las existencias y crean el movimiento en una operación atómica.
- Las reglas aíslan los datos por UID; también validan que los cambios de existencias se hagan con un movimiento asociado y protegen el historial de movimientos contra edición o borrado.
- El código del producto es opcional; si se proporciona, identifica el documento y queda inmutable luego de creado. La unidad de medida también es opcional.

Antes de cargar inventario real, prueba las reglas y transacciones con productos ficticios y dos cuentas. Mantén una copia de seguridad. Las reglas del proyecto deben coincidir con `firestore.rules`; no uses reglas globales abiertas.

## Validación de producción

```powershell
npm.cmd run build
npm.cmd run lint
```

El alcance excluye facturación electrónica, contabilidad, múltiples sucursales y aplicación móvil.
