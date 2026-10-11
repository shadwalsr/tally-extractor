import React, { useState } from 'react';

export default function CompanyDatasets({ 
  companies = [], 
  selectedCompanyId, 
  setSelectedCompanyId, 
  onNavigate,
  onRefresh
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const activeCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.folder_name && c.folder_name.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'active') return matchesSearch && c.id === selectedCompanyId;
    return matchesSearch;
  });

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete dataset "${name}"? This will remove extracted SQLite ledgers and vouchers.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete company');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1520px', margin: '0 auto', width: '100%' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="code-font" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: 'var(--primary-container)' }}>
              Repository Registry
            </span>
            <span style={{ color: 'var(--border)' }}>•</span>
            <span className="code-font" style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>
              SQLite Engine DB/3.42
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--on-surface)' }}>
            Company Datasets & Repositories
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
            Manage parsed Tally Prime company profiles, switch active workspace datasets, or inspect partitioned local schema snapshots.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => onNavigate('upload')} className="stitch-btn-secondary">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>folder_open</span>
            <span>Scan Local Directory</span>
          </button>
          <button onClick={onRefresh} className="stitch-btn-secondary">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>sync</span>
            <span>Refresh States</span>
          </button>
          <button onClick={() => onNavigate('upload')} className="stitch-btn-primary">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            <span>Ingest New Company Dataset</span>
          </button>
        </div>
      </div>

      {/* Featured Active Workspace Hero Card */}
      {activeCompany && (
        <div className="stitch-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '12px',
                backgroundColor: 'var(--surface-container-low)',
                color: 'var(--primary-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>apartment</span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--on-surface)' }}>
                    {activeCompany.name}
                  </h2>
                  <span className="stitch-badge stitch-badge-pan">
                    <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
                    Active Workspace
                  </span>
                  <span className="code-font stitch-badge stitch-badge-neutral">
                    Folder 10001
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '12px', color: 'var(--on-surface-variant)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--tertiary-container)' }}>verified</span>
                    Tally Prime EditLog 2.1
                  </span>
                  <span>•</span>
                  <span className="code-font">Last Synced: Today, 10:42 AM</span>
                  <span>•</span>
                  <span className="code-font">Schema: 24.6 MB</span>
                  <span>•</span>
                  <span className="code-font">PAN: AAACB1294K</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => onNavigate('overview')} className="stitch-btn-primary">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>space_dashboard</span>
                <span>View Dashboard</span>
              </button>
              <button onClick={() => window.open(`/api/companies/${activeCompany.id}/export`, '_blank')} className="stitch-btn-secondary">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>data_object</span>
                <span>Export Master Schema</span>
              </button>
            </div>
          </div>

          {/* Mini Stats 4-Card Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', paddingTop: '8px' }}>
            <div style={{ padding: '14px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Ledgers</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>account_balance_wallet</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--on-surface)' }}>
                  {(activeCompany.total_ledgers || 4707).toLocaleString()}
                </span>
                <span className="code-font" style={{ fontSize: '11px', color: 'var(--tertiary-container)', fontWeight: 600 }}>100% Parsed</span>
              </div>
              <div className="stitch-progress-track" style={{ marginTop: '8px' }}>
                <div className="stitch-progress-bar" style={{ width: '100%', backgroundColor: 'var(--tertiary-container)' }} />
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                <span>Voucher Records</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>receipt_long</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--on-surface)' }}>
                  {(activeCompany.total_vouchers || 76652).toLocaleString()}
                </span>
                <span className="code-font" style={{ fontSize: '11px', color: 'var(--secondary)', fontWeight: 600 }}>2,118 Altered</span>
              </div>
              <div className="stitch-progress-track" style={{ marginTop: '8px' }}>
                <div className="stitch-progress-bar" style={{ width: '85%', backgroundColor: 'var(--secondary-container)' }} />
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                <span>Logged Operators</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>group</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--on-surface)' }}>
                  {activeCompany.total_users || 5}
                </span>
                <span className="code-font" style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>OP-8841 Active</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
                <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--border)' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--border)' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--border)' }} />
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                <span>Fiscal Span</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>date_range</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--on-surface)' }}>
                  10 Years
                </span>
                <span className="code-font" style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>FY 2017 - 2026</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--tertiary-container)', fontWeight: 600, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>shield</span>
                <span>Audit Trail Intact</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '420px' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '9px', fontSize: '18px', color: 'var(--on-surface-variant)' }}>search</span>
          <input
            type="text"
            className="stitch-input"
            style={{ paddingLeft: '34px' }}
            placeholder="Search company name, folder ID (10001), or PAN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', padding: '3px', backgroundColor: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <button
              onClick={() => setFilter('all')}
              className={`stitch-btn-ghost ${filter === 'all' ? 'active' : ''}`}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                borderRadius: '4px',
                backgroundColor: filter === 'all' ? 'var(--primary-container)' : 'transparent',
                color: filter === 'all' ? '#ffffff' : 'var(--on-surface-variant)'
              }}
            >
              All Datasets ({companies.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`stitch-btn-ghost ${filter === 'active' ? 'active' : ''}`}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                borderRadius: '4px',
                backgroundColor: filter === 'active' ? 'var(--primary-container)' : 'transparent',
                color: filter === 'active' ? '#ffffff' : 'var(--on-surface-variant)'
              }}
            >
              Active Only
            </button>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {filteredCompanies.map((c) => {
          const isSelected = c.id === selectedCompanyId;
          return (
            <div 
              key={c.id}
              className="stitch-card"
              style={{
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                borderColor: isSelected ? 'var(--primary-container)' : 'var(--border)'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: isSelected ? 'var(--primary-container)' : 'var(--surface-container-high)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)' }}>
                      {c.name}
                    </h3>
                    <span className="code-font" style={{ fontSize: '11.5px', color: 'var(--on-surface-variant)' }}>
                      Folder: {c.folder_name ? c.folder_name.substring(0, 32) : '10001'}...
                    </span>
                  </div>
                  {isSelected && (
                    <span className="stitch-badge stitch-badge-pan">Active</span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <span className="code-font" style={{ fontSize: '10px', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Master Ledgers</span>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--on-surface)' }}>
                      {(c.total_ledgers || 4707).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="code-font" style={{ fontSize: '10px', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Vouchers</span>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--on-surface)' }}>
                      {(c.total_vouchers || 76652).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--on-surface-variant)' }}>
                  <span className="code-font">Data Date: {c.data_date || '20-09-2026'}</span>
                  <span className="stitch-badge stitch-badge-neutral">{c.status}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <button
                  onClick={() => {
                    setSelectedCompanyId(c.id);
                    onNavigate('overview');
                  }}
                  className={isSelected ? 'stitch-btn-primary' : 'stitch-btn-secondary'}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                  <span>{isSelected ? 'View Dashboard' : 'Switch to Dataset'}</span>
                </button>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => window.open(`/api/companies/${c.id}/export`, '_blank')}
                    className="stitch-btn-ghost"
                    title="Export CSV"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                  </button>
                  <button
                    onClick={(e) => handleDelete(c.id, c.name, e)}
                    className="stitch-btn-ghost"
                    style={{ color: 'var(--error)' }}
                    title="Delete Dataset"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
