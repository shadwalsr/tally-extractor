import React from 'react';

export default function Header({ 
  currentTab, 
  currentCompany, 
  onRefresh, 
  onOpenUpload, 
  isRefreshing 
}) {
  const handleExportClick = () => {
    if (!currentCompany) return;
    window.open(`/api/companies/${currentCompany.id}/export`, '_blank');
  };

  const getBreadcrumbTitle = () => {
    switch (currentTab) {
      case 'overview': return 'Overview & KPIs';
      case 'ledgers': return 'Master Ledgers';
      case 'vouchers': return 'Voucher Records';
      case 'activity': return 'Audit & Operators';
      case 'upload': return 'Ingestion Engine';
      case 'companies': return 'Company Datasets';
      default: return 'Overview & KPIs';
    }
  };

  return (
    <header className="header-stitch">
      {/* Left Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--on-surface-variant)', minWidth: 0 }}>
        <span style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}>Audit Extraction</span>
        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#94a3b8' }}>chevron_right</span>
        <span style={{ fontWeight: 600, color: 'var(--on-surface)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {currentCompany ? currentCompany.name : 'BMW Ventures Limited'}
        </span>
        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#94a3b8' }}>chevron_right</span>
        <span className="code-font" style={{
          fontSize: '11px',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: 'var(--surface-container-high)',
          color: 'var(--on-surface)'
        }}>
          EditLog Active
        </span>
      </div>

      {/* Right Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button 
          onClick={onRefresh} 
          disabled={isRefreshing}
          className="stitch-btn-secondary"
          title="Refresh Data from SQLite"
        >
          <span className={`material-symbols-outlined ${isRefreshing ? 'spin-icon' : ''}`} style={{ fontSize: '16px' }}>refresh</span>
          <span>Refresh Data</span>
        </button>

        {currentCompany && (
          <button 
            onClick={handleExportClick}
            className="stitch-btn-secondary"
            title="Export Master Ledgers as CSV"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>ios_share</span>
            <span>Export CSV</span>
          </button>
        )}

        <button 
          onClick={onOpenUpload}
          className="stitch-btn-primary"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload_file</span>
          <span>Ingest Data</span>
        </button>

        {/* Auditor Profile Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingLeft: '12px',
          borderLeft: '1px solid var(--border)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-container)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 600
          }}>
            SA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface)', lineHeight: '1.1' }}>
              Senior Auditor
            </span>
            <span className="code-font" style={{ fontSize: '10px', color: 'var(--on-surface-variant)', lineHeight: '1.2', marginTop: '2px' }}>
              ID: OP-8841
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
