'use client';

import { FormEvent, useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { clearAdminSession, getAdminSession } from '@/lib/oidc';

type MarginRule = {
  _id: string;
  scope: 'global' | 'category' | 'vendor' | 'item';
  marginPercentage: number;
  categorySlug?: string;
  vendorId?: string;
  itemId?: string;
};

type Interest = {
  _id: string;
  businessName: string;
  contactName: string;
  email: string;
  status: string;
};

const SCOPE_STYLES: Record<string, string> = {
  global: 'scope-global',
  category: 'scope-category',
  vendor: 'scope-vendor',
  item: 'scope-item',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'badge badge-warning',
  approved: 'badge badge-success',
  rejected: 'badge badge-danger',
  reviewed: 'badge badge-neutral',
};

export default function AdminDashboardPage() {
  const [margins, setMargins] = useState<MarginRule[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<'overview' | 'margins' | 'vendors'>('overview');
  const [showMarginForm, setShowMarginForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = (section: 'overview' | 'margins' | 'vendors') => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const [marginForm, setMarginForm] = useState({
    scope: 'global',
    marginPercentage: 10,
    categorySlug: '',
    vendorId: '',
    itemId: '',
    notes: '',
  });

  const loadData = async () => {
    try {
      const marginResp = await adminApi<any>('/admin/margins');
      const interestResp = await adminApi<any>('/vendor-interest?status=pending');
      setMargins(marginResp?.data?.margins || []);
      setInterests(interestResp?.data?.interests || []);
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Failed to load admin data');
    }
  };

  useEffect(() => {
    const session = getAdminSession();
    if (!session?.accessToken) {
      globalThis.location.assign('/');
      return;
    }
    loadData();
  }, []);

  const onSetMargin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await adminApi('/admin/margins', {
        method: 'POST',
        body: JSON.stringify({
          ...marginForm,
          marginPercentage: Number(marginForm.marginPercentage),
        }),
      });
      await loadData();
      setShowMarginForm(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to set margin');
    }
  };

  const reviewInterest = async (id: string, status: 'approved' | 'rejected' | 'reviewed') => {
    try {
      await adminApi(`/vendor-interest/${id}/review`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to review vendor interest');
    }
  };

  return (
    <div className="app-shell">
      <button
        className={`sidebar-overlay${sidebarOpen ? ' active' : ''}`}
        aria-label="Close menu"
        onClick={() => setSidebarOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
      />
      {/* ── Sidebar ── */}
      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="sidebar-mark">WW</div>
            <div>
              <div className="sidebar-name">WishWing</div>
              <span className="sidebar-tag">Admin</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-group-label">Menu</div>

          <button
            className={`nav-link${activeSection === 'overview' ? ' active' : ''}`}
            onClick={() => navigate('overview')}
          >
            <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Overview
          </button>

          <button
            className={`nav-link${activeSection === 'margins' ? ' active' : ''}`}
            onClick={() => navigate('margins')}
          >
            <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Margins
          </button>

          <button
            className={`nav-link${activeSection === 'vendors' ? ' active' : ''}`}
            onClick={() => navigate('vendors')}
          >
            <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Vendors
            {interests.length > 0 && (
              <span className="nav-badge">{interests.length}</span>
            )}
          </button>
        </nav>

        <div className="sidebar-foot">
          <button
            className="nav-link"
            onClick={() => { clearAdminSession(); globalThis.location.assign('/'); }}
          >
            <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        <header className="page-header">
          <button className="hamburger" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="page-title">
            {activeSection === 'overview' && 'Overview'}
            {activeSection === 'margins' && 'Margin Rules'}
            {activeSection === 'vendors' && 'Vendor Queue'}
          </h1>
          {activeSection === 'margins' && !showMarginForm && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowMarginForm(true)}>
              + Add rule
            </button>
          )}
        </header>

        <main className="page-body">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* ── Overview ── */}
          {activeSection === 'overview' && (
            <>
              <div className="stats-grid">
                <div className="stat-card stat-card-blue">
                  <span className="stat-label">Margin rules</span>
                  <span className="stat-value">{margins.length}</span>
                  <span className="stat-meta">Active across all scopes</span>
                </div>
                <div className="stat-card stat-card-amber">
                  <span className="stat-label">Pending vendors</span>
                  <span className="stat-value" style={interests.length > 0 ? { color: '#ca8a04' } : {}}>
                    {interests.length}
                  </span>
                  <span className="stat-meta">Awaiting review</span>
                </div>
                <div className="stat-card stat-card-teal">
                  <span className="stat-label">Access control</span>
                  <span className="stat-value" style={{ fontSize: '0.95rem', paddingTop: '0.5rem', fontFamily: 'inherit', fontWeight: 600 }}>
                    Role-gated
                  </span>
                  <span className="stat-meta">FidId SSO protected</span>
                </div>
              </div>

              <div className="grid-2">
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-title">Recent margin rules</p>
                      <p className="panel-sub">Latest configured scopes</p>
                    </div>
                    <button className="chip" onClick={() => setActiveSection('margins')}>
                      View all →
                    </button>
                  </div>
                  {margins.slice(0, 4).length > 0 ? (
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {margins.slice(0, 4).map((m) => (
                        <div key={m._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <span className={`scope-tag ${SCOPE_STYLES[m.scope] || ''}`}>{m.scope}</span>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{m.marginPercentage}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted" style={{ fontSize: '0.875rem' }}>No margin rules configured yet.</p>
                  )}
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-title">Vendor queue</p>
                      <p className="panel-sub">Pending applications</p>
                    </div>
                    <button className="chip" onClick={() => setActiveSection('vendors')}>
                      Review →
                    </button>
                  </div>
                  {interests.slice(0, 3).length > 0 ? (
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {interests.slice(0, 3).map((v) => (
                        <div key={v._id} style={{ padding: '0.65rem 0.75rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <strong style={{ fontSize: '0.875rem' }}>{v.businessName}</strong>
                            <span className="badge badge-warning">pending</span>
                          </div>
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>{v.email}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state" style={{ padding: '1.5rem' }}>
                      <div className="empty-icon">✅</div>
                      <p className="empty-title">All clear</p>
                      <p className="empty-text">No pending applications.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── Margins ── */}
          {activeSection === 'margins' && (
            <>
              {showMarginForm && (
                <div className="panel" style={{ marginBottom: '1.25rem' }}>
                  <div className="panel-header" style={{ marginBottom: '0.75rem' }}>
                    <div>
                      <p className="panel-title">New margin rule</p>
                      <p className="panel-sub">Precedence order: item › vendor › category › global</p>
                    </div>
                  </div>
                  <form className="fields" onSubmit={onSetMargin}>
                    <div className="fields cols-2">
                      <label>
                        <span>Scope</span>
                        <select
                          value={marginForm.scope}
                          onChange={(e) => setMarginForm({ ...marginForm, scope: e.target.value })}
                        >
                          <option value="global">Global</option>
                          <option value="category">Category</option>
                          <option value="vendor">Vendor</option>
                          <option value="item">Item</option>
                        </select>
                      </label>
                      <label>
                        <span>Margin (%)</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={marginForm.marginPercentage}
                          onChange={(e) =>
                            setMarginForm({ ...marginForm, marginPercentage: Number(e.target.value) })
                          }
                        />
                      </label>
                    </div>
                    <div className="fields cols-2">
                      <label>
                        <span>Category slug</span>
                        <input
                          placeholder="Only for category scope"
                          value={marginForm.categorySlug}
                          onChange={(e) => setMarginForm({ ...marginForm, categorySlug: e.target.value })}
                        />
                      </label>
                      <label>
                        <span>Vendor ID</span>
                        <input
                          placeholder="Only for vendor scope"
                          value={marginForm.vendorId}
                          onChange={(e) => setMarginForm({ ...marginForm, vendorId: e.target.value })}
                        />
                      </label>
                    </div>
                    <label>
                      <span>Item ID</span>
                      <input
                        placeholder="Only for item scope"
                        value={marginForm.itemId}
                        onChange={(e) => setMarginForm({ ...marginForm, itemId: e.target.value })}
                      />
                    </label>
                    <label>
                      <span>Notes</span>
                      <textarea
                        placeholder="Internal notes for audit trail"
                        value={marginForm.notes}
                        onChange={(e) => setMarginForm({ ...marginForm, notes: e.target.value })}
                      />
                    </label>
                    <div className="inline-row" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowMarginForm(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">Save rule</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <p className="panel-title">Active margin rules</p>
                    <p className="panel-sub">{margins.length} rule{margins.length === 1 ? '' : 's'} configured</p>
                  </div>
                  {!showMarginForm && (
                    <button className="btn btn-primary btn-sm" onClick={() => setShowMarginForm(true)}>
                      + Add rule
                    </button>
                  )}
                </div>
                {margins.length > 0 ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Scope</th>
                          <th>Margin</th>
                          <th>Category slug</th>
                          <th>Vendor ID</th>
                          <th>Item ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {margins.map((m) => (
                          <tr key={m._id}>
                            <td>
                              <span className={`scope-tag ${SCOPE_STYLES[m.scope] || ''}`}>{m.scope}</span>
                            </td>
                            <td><strong>{m.marginPercentage}%</strong></td>
                            <td>{m.categorySlug || <span className="muted-2">—</span>}</td>
                            <td>
                              {m.vendorId ? <code>{m.vendorId}</code> : <span className="muted-2">—</span>}
                            </td>
                            <td>
                              {m.itemId ? <code>{m.itemId}</code> : <span className="muted-2">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <p className="empty-title">No margin rules yet</p>
                    <p className="empty-text">Add your first rule to govern margins across the marketplace.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Vendors ── */}
          {activeSection === 'vendors' && (
            <div className="panel">
              <div className="panel-header">
                <div>
                  <p className="panel-title">Vendor interest queue</p>
                  <p className="panel-sub">
                    {interests.length > 0
                      ? `${interests.length} pending application${interests.length === 1 ? '' : 's'}`
                      : 'No pending applications'}
                  </p>
                </div>
              </div>
              {interests.length > 0 ? (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {interests.map((v) => (
                    <div key={v._id} className="interest-card">
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.65rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>{v.businessName}</strong>
                          <p style={{ margin: '0.2rem 0 0', fontSize: '0.83rem', color: '#64748b' }}>
                            {v.contactName} &middot; {v.email}
                          </p>
                        </div>
                        <span className={STATUS_STYLES[v.status] || 'badge badge-neutral'}>{v.status}</span>
                      </div>
                      <div className="inline-row">
                        <button className="btn btn-success btn-sm" onClick={() => reviewInterest(v._id, 'approved')}>
                          Approve
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => reviewInterest(v._id, 'reviewed')}>
                          Mark reviewed
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => reviewInterest(v._id, 'rejected')}>
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">✅</div>
                  <p className="empty-title">Queue is clear</p>
                  <p className="empty-text">No pending vendor applications to review.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
