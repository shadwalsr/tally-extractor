import React from 'react';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  companies = [], 
  selectedCompanyId, 
  setSelectedCompanyId 
}) {
  const currentCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

  const auditNavItems = [
    { id: 'overview', label: 'Overview & KPIs', icon: 'space_dashboard' },
    { id: 'ledgers', label: 'Master Ledgers', icon: 'menu_book' },
    { id: 'vouchers', label: 'Voucher Records', icon: 'receipt_long' },
    { id: 'activity', label: 'Audit & Operators', icon: 'shield_person' },
    { id: 'upload', label: 'Ingestion Engine', icon: 'database' },
  ];

  const repoNavItems = [
    { id: 'companies', label: 'Company Datasets', icon: 'domain' },
  ];

  return (
    <aside className="sidebar-stitch">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Brand Header */}
        <div style={{ height: '56px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-container)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(67, 56, 202, 0.3)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>account_balance</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--on-surface)', lineHeight: '1.1' }}>
                TallyLog
              </span>
              <span className="code-font" style={{ fontSize: '10px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                EditLog 2.1 Engine
              </span>
            </div>
          </div>
        </div>

        {/* Active Dataset Pill Card */}
        <div style={{ padding: '12px 16px' }}>
          <div style={{
            padding: '10px 12px',
            backgroundColor: 'var(--surface-container-low)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary-container)' }}>corporate_fare</span>
                <select
                  value={selectedCompanyId || ''}
                  onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: 'var(--on-surface)',
                    width: '100%',
                    outline: 'none',
                    cursor: 'pointer',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--on-surface-variant)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
                <span className="code-font">{currentCompany?.status === 'ready' ? 'Synced • 10:42 AM' : 'Parsing...'}</span>
              </div>
              <span className="code-font" style={{ fontSize: '10px', color: 'var(--primary-container)', fontWeight: 600 }}>
                {currentCompany ? `ID #${currentCompany.id}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Audit Ledgers */}
        <div style={{ padding: '4px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Audit Ledgers
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px 12px' }}>
          {auditNavItems.map(item => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: active ? 'var(--primary-container)' : 'transparent',
                  color: active ? '#ffffff' : 'var(--on-surface-variant)',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: active ? '0 1px 3px rgba(67, 56, 202, 0.25)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-container-high)';
                    e.currentTarget.style.color = 'var(--on-surface)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--on-surface-variant)';
                  }
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: active ? '#ffffff' : 'inherit' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Section 2: Repositories */}
        <div style={{ padding: '16px 20px 4px', fontSize: '11px', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Repositories
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px 12px' }}>
          {repoNavItems.map(item => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: active ? 'var(--primary-container)' : 'transparent',
                  color: active ? '#ffffff' : 'var(--on-surface-variant)',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: active ? '0 1px 3px rgba(67, 56, 202, 0.25)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-container-high)';
                    e.currentTarget.style.color = 'var(--on-surface)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--on-surface-variant)';
                  }
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: active ? '#ffffff' : 'inherit' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface-container-lowest)' }}>
        <div style={{ padding: '10px 12px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="pulse-dot" style={{ width: '8px', height: '8px' }} />
              <span className="code-font" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--on-surface)' }}>SQLite 3.42</span>
            </div>
            <span className="code-font" style={{ fontSize: '10px', color: 'var(--tertiary-container)', fontWeight: 600, textTransform: 'uppercase' }}>Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--on-surface-variant)' }}>
            <span className="code-font">Parser Version</span>
            <span className="code-font" style={{ fontWeight: 600, color: 'var(--on-surface)' }}>v2.1.4</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
