'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { completeAdminLogin } from '@/lib/oidc';
import { errorFromUnknown } from '@/lib/errors';

function AdminCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Completing Signin with FidId...');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (!code || !state) {
      setMessage('Invalid callback parameters.');
      return;
    }

    completeAdminLogin(code, state)
      .then((session) => {
        if (session.role !== 'admin' && session.role !== 'superadmin') {
          setMessage('Access denied: admin role required.');
          return;
        }
        router.replace('/dashboard');
      })
      .catch((err) => {
        setMessage(errorFromUnknown(err, 'Signin callback failed'));
      });
  }, [router, searchParams]);

  return (
    <main className="layout">
      <div className="shell">
        <nav className="topbar">
          <a className="brand" href="/">
            <span className="brand-mark">WW</span>
            <span>WishWing Admin Web</span>
          </a>
        </nav>
        <section className="panel" style={{ maxWidth: 620, margin: '1rem auto 0' }}>
          <h1>Completing Signin</h1>
          <p className="muted" style={{ marginTop: '0.6rem' }}>
            {message}
          </p>
        </section>
      </div>
    </main>
  );
}

export default function AdminCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="layout">
          <div className="shell">
            <nav className="topbar">
              <a className="brand" href="/">
                <span className="brand-mark">WW</span>
                <span>WishWing Admin Web</span>
              </a>
            </nav>
            <section className="panel" style={{ maxWidth: 620, margin: '1rem auto 0' }}>
              <h1>Completing Signin</h1>
              <p className="muted" style={{ marginTop: '0.6rem' }}>
                Completing Signin with FidId...
              </p>
            </section>
          </div>
        </main>
      }
    >
      <AdminCallbackContent />
    </Suspense>
  );
}
