'use client';

import { FormEvent, useState } from 'react';
import { startAdminLogin } from '@/lib/oidc';

export default function AdminSigninPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await startAdminLogin(identifier, password);
    } catch (err: any) {
      setError(err?.message || 'Signin failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-brand-panel">
        <div className="auth-logo">
          <div className="auth-logo-mark">WW</div>
          <span className="auth-logo-name">
            WishWing
            <span className="auth-logo-tag">Admin</span>
          </span>
        </div>

        <div className="auth-brand-body">
          <h1 className="auth-brand-title">
            Admin control centre for WishWing
          </h1>
          <p className="auth-brand-desc">
            Manage vendor onboarding, configure margin rules at any scope, and keep the marketplace running smoothly.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-dot" />
              Role-gated admin access via FidId SSO
            </div>
            <div className="auth-feature">
              <div className="auth-feature-dot" />
              Global, category, vendor &amp; item margin controls
            </div>
            <div className="auth-feature">
              <div className="auth-feature-dot" />
              Vendor interest approval queue with full audit trail
            </div>
          </div>
        </div>

        <p className="auth-brand-foot">
          © {new Date().getFullYear()} WishWing — Admin operations
        </p>
      </div>

      <div className="auth-form-panel">
        <div className="auth-card">
          <h2 className="auth-card-title">Sign in</h2>
          <p className="auth-card-sub">Admin or superadmin account required.</p>

          <form className="fields" onSubmit={onSubmit}>
            <label>
              <span>Email or FidId</span>
              <input
                required
                placeholder="admin@example.com or @fidid"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </label>
            <label>
              <span>Password</span>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && <p className="error">{error}</p>}

            <button type="submit" disabled={loading} className="btn-submit-auth">
              {loading ? 'Signing in…' : 'Sign in with FidId'}
            </button>
          </form>

          <div className="auth-links">
            <a href="/interest" className="auth-link">Interest queue info</a>
            <span className="auth-link-sep">·</span>
            <a
              href="https://wishwing.fidcent.com"
              target="_blank"
              rel="noreferrer"
              className="auth-link"
            >
              Landing page ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
