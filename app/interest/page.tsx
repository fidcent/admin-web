export default function InterestInfoPage() {
  return (
    <main className="layout">
      <div className="shell">
        <nav className="topbar">
          <a className="brand" href="/dashboard">
            <span className="brand-mark">WW</span>
            <span>WishWing Admin</span>
          </a>
          <div className="top-links">
            <a href="/dashboard">← Back to Dashboard</a>
          </div>
        </nav>

        <div style={{ maxWidth: 760, margin: '2rem auto 0' }}>
          <div className="panel">
            <div style={{ marginBottom: '1.25rem' }}>
              <h1 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.4rem', color: '#0f172a' }}>
                Vendor Interest Workflow
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Vendor applications submitted via vendor-web are processed here. Each application moves through a defined review flow.
              </p>
            </div>

            <div className="badge-row" style={{ marginBottom: '1.25rem' }}>
              <span className="badge badge-warning">pending</span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>→</span>
              <span className="badge badge-neutral">reviewed</span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>→</span>
              <span className="badge badge-success">approved</span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>or</span>
              <span className="badge badge-danger">rejected</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {[
                { step: '1', title: 'Submission', desc: 'New application arrives with business profile and intended product categories.' },
                { step: '2', title: 'Review', desc: 'Admin evaluates fulfillment capability for physical_gift and booked_service.' },
                { step: '3', title: 'Decision', desc: 'Outcome is recorded. Approved vendors can sign in to the vendor portal.' },
              ].map(({ step, title, desc }) => (
                <div key={step} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', background: '#f8fafc' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.6rem', height: '1.6rem', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                    {step}
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: '0 0 0.3rem', color: '#0f172a' }}>{title}</p>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>

            <div style={{ border: '1px solid #bfdbfe', borderRadius: '10px', background: '#eff6ff', padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <p style={{ color: '#1e40af', fontSize: '0.875rem', margin: 0 }}>
                Ready to process applications? Head to the vendor queue in the dashboard.
              </p>
              <a href="/dashboard" className="btn btn-primary btn-sm">
                Open queue →
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
