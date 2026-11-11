import { Icon } from '../../componentes/Icon.jsx';

export default function Settings({ user, profileName, compactView, darkMode, saving, onSubmit }) {
    return (
        <section className="settings-grid">
            <form className="panel settings-panel" onSubmit={onSubmit}>
                <div className="panel-heading settings-heading">
                    <div>
                        <h2>Perfil de usuario</h2>
                        <p>El nombre se actualiza en Firebase Authentication.</p>
                    </div>
                    <span className="settings-icon"><Icon name="users" /></span>
                </div>
                <label className="field">
                    Nombre visible
                    <input name="displayName" required maxLength={80} defaultValue={profileName} placeholder="Tu nombre" />
                </label>
                <label className="field">
                    Correo electrónico
                    <input value={user.email ?? ''} readOnly />
                </label>
                <div className="settings-divider" />
                <div className="panel-heading settings-heading">
                    <div>
                        <h2>Preferencias visuales</h2>
                        <p>Estas preferencias se guardan en este navegador para tu cuenta.</p>
                    </div>
                    <span className="settings-icon"><Icon name="settings" /></span>
                </div>
                <label className="preference-option">
                    <span>
                        <strong>Vista compacta</strong>
                        <small>Reduce el espacio de las tablas para mostrar más filas.</small>
                    </span>
                    <input name="compactView" type="checkbox" defaultChecked={compactView} />
                </label>
                <label className="preference-option">
                    <span>
                        <strong>Modo oscuro</strong>
                        <small>Usa colores oscuros en las pantallas del inventario para reducir el brillo.</small>
                    </span>
                    <input name="darkMode" type="checkbox" defaultChecked={darkMode} />
                </label>
                <div className="settings-actions">
                    <button className="button button-primary" disabled={saving}>
                        <Icon name="check" />
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </form>
        </section>
    );
}
