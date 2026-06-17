import { useState } from 'react';
import { t } from '../../lib/i18n';
import type { User } from '../../lib/types';

interface LoginFormProps {
  onSuccess: (user: User) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [serverUrl, setServerUrl] = useState('http://m2mini.local:8080');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await new Promise<{ success?: boolean; user?: User; error?: string }>(
        (resolve) => {
          chrome.runtime.sendMessage(
            {
              type: 'LOGIN',
              serverUrl,
              email,
              password,
            },
            resolve
          );
        }
      );

      if (response.error) {
        setError(response.error);
      } else if (response.user) {
        onSuccess(response.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg mb-3">
          <span className="text-white text-xl font-bold">S</span>
        </div>
        <h2 className="text-xl font-display font-bold text-gray-900">
          {t('auth.signIn')}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {t('auth.connectTo')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('auth.serverUrl')}
          </label>
          <input
            type="url"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder={t('auth.serverUrlPlaceholder')}
            required
            className="input"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('auth.email')}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
            required
            className="input"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('auth.password')}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              required
              minLength={8}
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? t('auth.signingIn') : t('auth.signIn')}
        </button>
      </form>
    </div>
  );
}
