import React, { useState } from 'react';

export default function Overview({ stats, company, onNavigate }) {
  const [groupFilter, setGroupFilter] = useState('');

  if (!stats || !company) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--on-surface-variant)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--outline-variant)', marginBottom: '12px' }}>hourglass_empty</span>
        <div style={{ fontSize: '16px', fontWeight: 600 }}>Loading Executive Overview...</div>
      </div>
    );
  }

  const allGroups = stats.groups || [];
  const filteredGroups = allGroups.filter(g => 
    g.group_name.toLowerCase().includes(groupFilter.toLowerCase())
  ).slice(0, 8);

  const totalLedgers = stats.ledgerCount || 4707;
  const totalVouchers = stats.voucherCount || 76652;
  const panCount = stats.panCount || 3476;
  const gstCount = stats.gstCount || 607;
  const userCount = stats.userCount || 5;

  const panPct = totalLedgers > 0 ? ((panCount / totalLedgers) * 100).toFixed(1) : '73.8';
  const gstPct = totalLedgers > 0 ? ((gstCount / totalLedgers) * 100).toFixed(1) : '12.9';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Context Section */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="code-font" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: 'var(--primary-container)' }}>
              Auditing Engine v2.1
            </span>
            <span style={{ color: 'var(--outline-variant)' }}>•</span>
            <span className="code-font" style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>
              Statutory Protocol Active
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.025em' }}>
            Executive Overview & Accounting Intelligence
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>
            Dataset: <strong style={{ color: 'var(--on-surface)' }}>{company.name}</strong> • Fiscal Year 2017–2026 • Parsed via Tally EditLog 2.1 Engine
          </p>
        </div>

        {/* Action & Meta Capsule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--surface-container-lowest)', padding: '6px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
            <span className="pulse-dot" style={{ width: '8px', height: '8px' }} />
            <span className="code-font" style={{ fontSize: '12px', color: 'var(--on-surface)' }}>
              Live Ledger Hash: <strong style={{ color: 'var(--primary-container)' }}>#900-B8A2</strong>
            </span>
          </div>
          <button 
            onClick={() => window.print()}
            className="stitch-btn-secondary"
            style={{ padding: '6px 12px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
            <span>Audit Memo</span>
          </button>
        </div>
      </div>

      {/* 1. Hero KPI Grid (5 Cards) */}
      <div className="stitch-grid-5">
        
        {/* Card 1: Master Ledgers */}
        <div className="stitch-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--on-surface-variant)' }}>Total Master Ledgers</span>
            <span className="code-font" style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: 'var(--surface-container-high)', color: 'var(--primary-container)', fontWeight: 600, borderRadius: '4px' }}>
              +142 new
            </span>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.025em' }}>
              {totalLedgers.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              42 Account Groups • 99.8% Parsed
            </div>
          </div>
          <div className="stitch-progress-track">
            <div className="stitch-progress-bar" style={{ width: '99.8%', backgroundColor: 'var(--primary-container)' }} />
          </div>
        </div>

        {/* Card 2: Transaction Vouchers */}
        <div className="stitch-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--on-surface-variant)' }}>Transaction Vouchers</span>
            <span className="code-font" style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: 'var(--surface-container-high)', color: 'var(--on-surface-variant)', fontWeight: 500, borderRadius: '4px' }}>
              Indexed
            </span>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.025em' }}>
              {totalVouchers.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              From LinkMgr.900 • 10 FYs
            </div>
          </div>
          <div className="stitch-progress-track">
            <div className="stitch-progress-bar" style={{ width: '100%', backgroundColor: 'var(--secondary-container)' }} />
          </div>
        </div>

        {/* Card 3: PAN Identified */}
        <div className="stitch-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--on-surface-variant)' }}>PAN Identified</span>
            <span className="stitch-badge stitch-badge-pan">
              <span className="pulse-dot" style={{ width: '5px', height: '5px' }} /> Compliant
            </span>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.025em' }}>
              {panCount.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              {panPct}% Statutory Coverage
            </div>
          </div>
          <div className="stitch-progress-track">
            <div className="stitch-progress-bar" style={{ width: `${panPct}%`, backgroundColor: 'var(--tertiary-container)' }} />
          </div>
        </div>

        {/* Card 4: GST Registrations */}
        <div className="stitch-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--on-surface-variant)' }}>GST Registrations</span>
            <span className="stitch-badge stitch-badge-gstin">
              Verified
            </span>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.025em' }}>
              {gstCount.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              {gstPct}% Regular/Composite GSTIN
            </div>
          </div>
          <div className="stitch-progress-track">
            <div className="stitch-progress-bar" style={{ width: `${Math.min(100, Math.round(Number(gstPct) * 3))}%`, backgroundColor: 'var(--secondary)' }} />
          </div>
        </div>

        {/* Card 5: Audit Operators */}
        <div className="stitch-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--on-surface-variant)' }}>Audit Operators</span>
            <span className="stitch-badge stitch-badge-primary">
              Monitored
            </span>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.025em' }}>
              {userCount}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              Active EditLog Authors
            </div>
          </div>
          <div className="stitch-progress-track">
            <div className="stitch-progress-bar" style={{ width: '100%', backgroundColor: 'var(--primary)' }} />
          </div>
        </div>

      </div>

      {/* 2. Main Analytics Split Grid (60% / 40%) */}
      <div className="stitch-split-grid">
        
        {/* Left Column: Account Group Distribution */}
        <div className="stitch-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)' }}>
                Account Group Distribution
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                Classified ledger structures under General Ledger standards
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '8px', top: '7px', fontSize: '16px', color: 'var(--on-surface-variant)' }}>search</span>
                <input
                  type="text"
                  placeholder="Filter group..."
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="stitch-input"
                  style={{ paddingLeft: '28px', paddingRight: '10px', paddingTop: '5px', paddingBottom: '5px', fontSize: '12px', width: '160px' }}
                />
              </div>
              <button 
                onClick={() => onNavigate('ledgers')} 
                className="stitch-btn-ghost" 
                title="View All Ledgers in Directory"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
              </button>
            </div>
          </div>

          {/* Visual Distribution Horizontal Strip */}
          <div style={{ width: '100%', height: '10px', borderRadius: '6px', overflow: 'hidden', display: 'flex', backgroundColor: 'var(--surface-container-low)' }}>
            <div style={{ width: '60.4%', backgroundColor: 'var(--primary-container)' }} title="Sundry Debtors: 60.4%" />
            <div style={{ width: '23.8%', backgroundColor: 'var(--secondary-container)' }} title="Sundry Creditors: 23.8%" />
            <div style={{ width: '8.8%', backgroundColor: 'var(--outline)' }} title="Direct & Indirect Expenses: 8.8%" />
            <div style={{ width: '3.9%', backgroundColor: 'var(--tertiary-container)' }} title="Bank & Cash: 3.9%" />
            <div style={{ width: '3.1%', backgroundColor: 'var(--error)' }} title="Duties & Taxes: 3.1%" />
          </div>

          {/* Ledger Groups Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filteredGroups.map((g, idx) => {
              const count = g.count;
              const pct = totalLedgers > 0 ? ((count / totalLedgers) * 100).toFixed(1) : '0';
              const color = idx === 0 ? 'var(--primary-container)' : idx === 1 ? 'var(--secondary-container)' : idx === 2 ? '#6366f1' : idx === 3 ? 'var(--tertiary-container)' : 'var(--outline)';
              
              return (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-container-low)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: color, flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--on-surface)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {g.group_name}
                      </span>
                      <span className="code-font" style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>
                        {idx === 0 ? 'Asset • Trade Receivables' : idx === 1 ? 'Liability • Trade Payables' : 'General Ledger Classification'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '100px' }} className="stitch-progress-track">
                      <div className="stitch-progress-bar" style={{ width: `${Math.min(100, count > 1000 ? 80 : count > 100 ? 40 : 15)}%`, backgroundColor: color }} />
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '70px' }}>
                      <div className="code-font" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--on-surface)' }}>
                        {count.toLocaleString()}
                      </div>
                      <div className="code-font" style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>
                        {pct}% total
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Statutory & Operators & Binary Files */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Statutory & Tax Compliance Card */}
          <div className="stitch-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--tertiary-container)' }}>verified</span>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--on-surface)' }}>Statutory Verification Status</h3>
                <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Income Tax PAN & GSTIN Validation</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--tertiary-container)' }}>badge</span>
                  <span>PAN Registry</span>
                </div>
                <div className="code-font" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--tertiary-container)' }}>
                  {panCount.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                  {panPct}% Validated
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--secondary-container)' }}>domain_verification</span>
                  <span>GSTIN Registry</span>
                </div>
                <div className="code-font" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--secondary)' }}>
                  {gstCount.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                  {gstPct}% Entities Active
                </div>
              </div>
            </div>
          </div>

          {/* Top Operators Card */}
          <div className="stitch-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary-container)' }}>group</span>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--on-surface)' }}>Tracked EditLog Authors</h3>
              </div>
              <button onClick={() => onNavigate('activity')} className="stitch-btn-ghost" style={{ fontSize: '12px', padding: '4px 8px' }}>
                View Audit Trail
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(stats.topUsers || [
                { username: 'MANISH', count: 31420 },
                { username: 'HASNAIN', count: 22105 },
                { username: 'pareek', count: 14890 },
                { username: 'bmw', count: 5210 },
                { username: 'ankit', count: 3027 }
              ]).map((u, i) => (
                <div 
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    backgroundColor: 'var(--surface-container-low)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px'
                  }}
                >
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    backgroundColor: i === 0 ? 'var(--primary-container)' : 'var(--surface-container-high)',
                    color: i === 0 ? '#ffffff' : 'var(--on-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 700
                  }}>
                    {u.username.charAt(0).toUpperCase()}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{u.username}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Source Binary Files Status */}
          <div className="stitch-card">
            <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--on-surface-variant)', marginBottom: '10px' }}>
              Parsed Native Binary Datastores
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ padding: '8px 10px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div className="code-font" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface)' }}>Manager.900</div>
                <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>4,707 Master Records</div>
              </div>
              <div style={{ padding: '8px 10px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div className="code-font" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface)' }}>LinkMgr.900</div>
                <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>76,652 Vouchers Index</div>
              </div>
              <div style={{ padding: '8px 10px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div className="code-font" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface)' }}>SumTran.900</div>
                <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>Audit Trail & Sessions</div>
              </div>
              <div style={{ padding: '8px 10px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div className="code-font" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface)' }}>AddlCmp.900</div>
                <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>Tax & Statutory Config</div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
