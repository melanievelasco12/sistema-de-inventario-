import { useState } from 'react';
import { Icon, GoogleMark } from '../../componentes/Icon.jsx';

export function LoginScreen({ configured, error, notice, busy, initialEmail, onClearMessages, onSubmit, onRegister, onGoogleSignIn, onPasswordReset }) {
    const [email, setEmail] = useState(initialEmail);
    const [rememberSession, setRememberSession] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [registering, setRegistering] = useState(false);
    const handleSubmit = registering ? onRegister : onSubmit;

    return (
        <main className="auth-screen login-screen">
            <div className="login-orbit login-orbit-left" aria-hidden="true" />
            <div className="login-orbit login-orbit-right" aria-hidden="true" />
            <div className="login-botanical" aria-hidden="true"><Icon name="leaf" /></div>
            <section className="auth-card login-card">
                <img className="login-brand-logo" src="/pasostock-mark.svg" alt="Logo de PasoStock" />
                <div className="login-wordmark"><span>Paso</span><strong>Stock</strong></div>
                <p className="login-tagline">Todo en su lugar, siempre.</p>
                <div className="login-intro">
                    <h1>{registering ? 'Crear cuenta' : 'Bienvenido'}</h1>
                    <p>{registering ? 'Crea tu cuenta y tu inventario privado' : 'Ingresa a tu cuenta para continuar'}</p>
                </div>
                {!configured && (
                    <div className="alert error-alert" role="alert">
                        Falta la configuración de Firebase. Copia .env.example como .env.local, completa los valores de tu aplicación web y reinicia el servidor de desarrollo.
                    </div>
                )}
                {error && <div className="alert error-alert" role="alert">{error}</div>}
                {notice && <div className="alert login-success" role="status">{notice}</div>}
                <form className="auth-form" onSubmit={(event) => registering
                    ? onRegister(event, (registeredEmail) => {
                        setRegistering(false);
                        setEmail(registeredEmail);
                        setShowPassword(false);
                    })
                    : handleSubmit(event)}>
                    {registering && (
                        <label className="field login-field">
                            <span>Nombre completo</span>
                            <span className="login-input-wrap">
                                <Icon name="users" />
                                <input name="name" type="text" autoComplete="name" minLength={2} maxLength={100} required placeholder="Tu nombre" />
                            </span>
                        </label>
                    )}
                    <label className="field login-field">
                        <span>Correo electrónico</span>
                        <span className="login-input-wrap">
                            <Icon name="mail" />
                            <input name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@correo.com" />
                        </span>
                    </label>
                    <label className="field login-field">
                        <span>Contraseña</span>
                        <span className="login-input-wrap">
                            <Icon name="lock" />
                            <input key={registering ? 'register-password' : 'login-password'} name="password" type={showPassword ? 'text' : 'password'} autoComplete={registering ? 'new-password' : 'current-password'} minLength={registering ? 6 : undefined} required placeholder={registering ? 'Mínimo 6 caracteres' : 'Tu contraseña'} />
                            <button className="password-toggle" type="button" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>
                                <Icon name={showPassword ? 'eyeOff' : 'eye'} />
                            </button>
                        </span>
                    </label>
                    {registering && (
                        <label className="field login-field">
                            <span>Confirmar contraseña</span>
                            <span className="login-input-wrap">
                                <Icon name="lock" />
                                <input name="passwordConfirmation" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={6} required placeholder="Repite tu contraseña" />
                            </span>
                        </label>
                    )}
                    <div className="login-options">
                        <label className="remember-option">
                            <input name="remember" type="checkbox" checked={rememberSession} onChange={(event) => setRememberSession(event.target.checked)} />
                            <span>Recordarme</span>
                        </label>
                        {!registering && (
                            <button type="button" className="forgot-password" disabled={!configured || busy || !email.trim()} onClick={() => onPasswordReset(email.trim())}>
                                ¿Olvidaste tu contraseña?
                            </button>
                        )}
                    </div>
                    <button className="button button-primary auth-submit login-submit" disabled={!configured || busy}>
                        <span>{busy ? (registering ? 'Creando cuenta...' : 'Ingresando...') : (registering ? 'Crear cuenta' : 'Iniciar sesión')}</span>
                        <Icon name="arrowRight" />
                    </button>
                </form>
                {!registering && (
                    <>
                        <div className="auth-divider login-divider"><span>O continúa también con</span></div>
                        <button type="button" className="google-button login-google" disabled={!configured || busy} onClick={() => onGoogleSignIn(rememberSession)}>
                            <GoogleMark />
                            {busy ? 'Conectando...' : 'Continuar con Google'}
                        </button>
                    </>
                )}
                <p className="login-register-switch">
                    {registering ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
                    {' '}
                    <button type="button" disabled={busy} onClick={() => { setRegistering(!registering); onClearMessages(); }}>
                        {registering ? 'Inicia sesión' : 'Crear cuenta'}
                    </button>
                </p>
                <p className="login-footnote">Acceso seguro para el equipo PasoStock</p>
            </section>
        </main>
    );
}

export function LoadingScreen({ message }) {
    return (
        <div className="auth-screen">
            <div className="auth-card auth-loading">
                <div className="brand-mark"><Icon name="leaf" /></div>
                <p>{message}</p>
            </div>
        </div>
    );
}

export function AccessErrorScreen({ message, onRetry, onSignOut }) {
    return (
        <main className="auth-screen">
            <section className="auth-card access-card">
                <div className="auth-brand">
                    <div className="brand-mark"><Icon name="leaf" /></div>
                    <div><strong>PasoStock</strong><span>CONEXIÓN CON FIRESTORE</span></div>
                </div>
                <p className="eyebrow">NO SE PUDO CARGAR EL INVENTARIO</p>
                <h1>Revisa la configuración</h1>
                <div className="alert error-alert" role="alert">{message}</div>
                <p className="auth-footnote">Comprueba que hayas publicado firestore.rules y creado Firestore Database para este proyecto.</p>
                <button className="button button-primary auth-submit" onClick={onRetry}>Volver a intentar</button>
                <button className="button button-plain auth-submit" onClick={onSignOut}>Cerrar sesión</button>
            </section>
        </main>
    );
}
