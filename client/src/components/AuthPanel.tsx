import { useState } from 'react';
import type { FormEvent } from 'react';
import type { AuthCredentials, AuthMode } from '../models/auth.interface';

interface AuthPanelProps {
  error: string;
  isSubmitting: boolean;
  onClearError: () => void;
  onSubmit: (mode: AuthMode, credentials: AuthCredentials) => Promise<void>;
}

export function AuthPanel({
  error,
  isSubmitting,
  onClearError,
  onSubmit,
}: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isRegistering = mode === 'register';

  function changeMode(nextMode: AuthMode): void {
    setMode(nextMode);
    onClearError();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await onSubmit(mode, {
      ...(isRegistering ? { name: name.trim() } : {}),
      email: email.trim(),
      password,
    });
  }

  return (
    <section className="panel auth-panel" aria-labelledby="auth-title">
      <div className="auth-tabs" role="tablist" aria-label="Acceso">
        <button
          type="button"
          role="tab"
          aria-selected={!isRegistering}
          className={!isRegistering ? 'auth-tab auth-tab--active' : 'auth-tab'}
          onClick={() => changeMode('login')}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isRegistering}
          className={isRegistering ? 'auth-tab auth-tab--active' : 'auth-tab'}
          onClick={() => changeMode('register')}
        >
          Crear cuenta
        </button>
      </div>

      <h2 id="auth-title">
        {isRegistering ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}
      </h2>
      <p className="auth-description">
        {isRegistering
          ? 'Regístrate para empezar a organizar tus tareas.'
          : 'Inicia sesión para consultar y actualizar las tareas.'}
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {isRegistering && (
          <label className="auth-field">
            <span>Nombre</span>
            <input
              type="text"
              autoComplete="name"
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
        )}
        <label className="auth-field">
          <span>Correo electrónico</span>
          <input
            type="email"
            autoComplete="email"
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="auth-field">
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            minLength={isRegistering ? 15 : 1}
            maxLength={72}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {isRegistering && (
            <small>Usa al menos 15 caracteres para crear tu cuenta.</small>
          )}
        </label>
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Conectando…'
            : isRegistering
              ? 'Crear cuenta'
              : 'Iniciar sesión'}
        </button>
      </form>
    </section>
  );
}
