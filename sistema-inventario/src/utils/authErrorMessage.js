export function isFirebaseAuthError(error) {
    return typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string';
}

export function authErrorMessage(code) {
    if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        return 'El correo o la contraseña no son correctos.';
    }
    if (code === 'auth/too-many-requests')
        return 'Se bloquearon temporalmente los intentos. Espera un momento y vuelve a intentarlo.';
    if (code === 'auth/network-request-failed')
        return 'No hay conexión con Firebase. Revisa tu internet e inténtalo de nuevo.';
    if (code === 'auth/invalid-email')
        return 'Escribe un correo electrónico válido.';
    if (code === 'auth/email-already-in-use')
        return 'Ya existe una cuenta con ese correo. Inicia sesión o usa otro correo.';
    if (code === 'auth/weak-password' || code === 'auth/password-does-not-meet-requirements')
        return 'La contraseña no cumple los requisitos de seguridad de Firebase.';
    if (code === 'auth/operation-not-allowed')
        return 'El método de acceso seleccionado no está habilitado en Firebase Authentication.';
    if (code === 'auth/popup-closed-by-user')
        return 'Cerraste la ventana de Google antes de completar el acceso.';
    if (code === 'auth/popup-blocked')
        return 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo de nuevo.';
    if (code === 'auth/web-storage-unsupported')
        return 'El navegador bloquea el almacenamiento necesario para iniciar sesión. Habilita cookies y almacenamiento del sitio o inténtalo en otro navegador.';
    if (code === 'auth/redirect-cancelled-by-user')
        return 'El acceso con Google se canceló antes de completarse.';
    if (code === 'auth/unauthorized-domain')
        return 'Este dominio no está autorizado para iniciar sesión. Añade localhost, 127.0.0.1 o el dominio de la aplicación en Firebase Authentication → Configuración → Dominios autorizados.';
    if (code === 'auth/account-exists-with-different-credential')
        return 'Ya existe una cuenta con ese correo usando otro método de acceso.';
    return 'No se pudo iniciar sesión. Revisa que la cuenta exista y vuelve a intentarlo.';
}
