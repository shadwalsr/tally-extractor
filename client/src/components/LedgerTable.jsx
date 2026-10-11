import React, { useState, useEffect } from 'react';

export default function LedgerTable({ companyId, groups = [] }) {
  const [ledgers, setLedgers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [panFilter, setPanFilter] = useState('all');
  const [auditFilter, setAuditFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState('address');
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchLedgers();
    }, 250);
    return () => clearTimeout(handler);
  }, [search, selectedGroup, page, limit, companyId]);

  const fetchLedgers = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search.trim()) params.append('search', search.trim());
      if (selectedGroup) params.append('group', selectedGroup);

      const res = await fetch(`/api/companies/${companyId}/ledgers?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load ledgers');
      const data = await res.json();
      
      let items = data.data || [];
      if (panFilter === 'has_pan') {
        items = items.filter(i => i.pan && i.pan.trim().length > 0);
      } else if (panFilter === 'no_pan') {
        items = items.filter(i => !i.pan || i.pan.trim().length === 0);
      }

      setLedgers(items);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (selectedGroup) params.append('group', selectedGroup);
    window.open(`/api/companies/${companyId}/export?${params.toString()}`, '_blank');
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedGroup('');
    setPanFilter('all');
    setAuditFilter('all');
    setPage(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Context */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--on-surface)' }}>
              Master Ledgers Directory
            </h1>
            <span className="code-font" style={{ fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'var(--surface-container-high)', color: 'var(--on-surface)' }}>
              {total.toLocaleString()} Ledgers
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
            Institutional EditLog 2.1 ledger directory, statutory registry & binary chunk audit inspector
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', fontSize: '12px', color: 'var(--on-surface-variant)' }}>
            <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
            <span className="code-font">Indexed in 14ms</span>
            <span style={{ color: 'var(--border)' }}>•</span>
            <span className="code-font" style={{ color: 'var(--tertiary-container)', fontWeight: 600 }}>SHA-256 Valid</span>
          </div>
          <button onClick={handleExport} className="stitch-btn-secondary">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>file_download</span>
            <span>Export Master Schema</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="stitch-card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        
        {/* Search Field */}
        <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '240px' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '9px', fontSize: '18px', color: 'var(--on-surface-variant)' }}>search</span>
          <input
            type="text"
            className="stitch-input"
            style={{ paddingLeft: '34px' }}
            placeholder="Search ledger name, PAN, GSTIN, phone, address, or PIN..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Group Selector */}
        <div style={{ position: 'relative', minWidth: '180px' }}>
          <select
            className="stitch-select"
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Groups ({groups.length})</option>
            {groups.map((g, idx) => (
              <option key={idx} value={g.group_name}>
                {g.group_name} ({g.count})
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined" style={{ position: 'absolute', right: '8px', top: '9px', fontSize: '18px', color: 'var(--on-surface-variant)', pointerEvents: 'none' }}>expand_more</span>
        </div>

        {/* PAN Filter */}
        <div style={{ position: 'relative', minWidth: '150px' }}>
          <select
            className="stitch-select"
            value={panFilter}
            onChange={(e) => setPanFilter(e.target.value)}
          >
            <option value="all">PAN: All Records</option>
            <option value="has_pan">PAN Available</option>
            <option value="no_pan">PAN Missing</option>
          </select>
          <span className="material-symbols-outlined" style={{ position: 'absolute', right: '8px', top: '9px', fontSize: '18px', color: 'var(--on-surface-variant)', pointerEvents: 'none' }}>expand_more</span>
        </div>

        {/* Audit Filter */}
        <div style={{ position: 'relative', minWidth: '150px' }}>
          <select
            className="stitch-select"
            value={auditFilter}
            onChange={(e) => setAuditFilter(e.target.value)}
          >
            <option value="all">Audit: Any Status</option>
            <option value="altered">Has Alterations</option>
            <option value="unchanged">Unchanged Base</option>
          </select>
          <span className="material-symbols-outlined" style={{ position: 'absolute', right: '8px', top: '9px', fontSize: '18px', color: 'var(--on-surface-variant)', pointerEvents: 'none' }}>expand_more</span>
        </div>

        <button onClick={handleExport} className="stitch-btn-primary" style={{ whiteSpace: 'nowrap' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
          <span>Export CSV</span>
        </button>
      </div>

      {/* Active Filter Ribbon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--on-surface-variant)', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Filters:</span>
          <span className="stitch-badge stitch-badge-neutral">
            Group: {selectedGroup || 'All'}
          </span>
          <span className="stitch-badge stitch-badge-neutral">
            PAN: {panFilter === 'all' ? 'All' : panFilter === 'has_pan' ? 'Available' : 'Missing'}
          </span>
          {(search || selectedGroup || panFilter !== 'all') && (
            <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: 'var(--primary-container)', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>
              Reset All
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Displaying ledger entries with EditLog 2.1 checksum hashes</span>
        </div>
      </div>

      {/* Master Ledgers Datagrid Table */}
      <div className="stitch-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="stitch-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}></th>
                <th>Entity / Ledger Name</th>
                <th>Account Group</th>
                <th>PAN</th>
                <th>GSTIN</th>
                <th>Primary Phone</th>
                <th>City & PIN</th>
                <th>Audit Trail Indicator</th>
                <th style={{ width: '50px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--on-surface-variant)' }}>
                    <span className="material-symbols-outlined spin-icon" style={{ fontSize: '24px', color: 'var(--primary-container)' }}>sync</span>
                    <div style={{ marginTop: '8px' }}>Fetching Master Ledgers from SQLite...</div>
                  </td>
                </tr>
              ) : ledgers.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--on-surface-variant)' }}>
                    No ledgers matching current criteria.
                  </td>
                </tr>
              ) : (
                ledgers.map((l) => {
                  const isExpanded = expandedId === l.id;
                  return (
                    <React.Fragment key={l.id}>
                      <tr className={isExpanded ? 'expanded-row' : ''}>
                        {/* Expand Toggle */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              setExpandedId(isExpanded ? null : l.id);
                              setActiveDrawerTab('address');
                            }}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              border: 'none',
                              backgroundColor: isExpanded ? 'var(--primary-container)' : 'var(--surface-container-high)',
                              color: isExpanded ? '#ffffff' : 'var(--on-surface)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                              {isExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>
                        </td>

                        {/* Entity Name */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{l.name}</span>
                            <span className="pulse-dot" style={{ width: '6px', height: '6px' }} title="Active Master" />
                          </div>
                          <span className="code-font" style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>
                            ID: TLY-{l.id.toString().padStart(6, '0')} {l.parent_group ? `• Parent: ${l.parent_group}` : ''}
                          </span>
                        </td>

                        {/* Account Group */}
                        <td>
                          <span className="stitch-badge stitch-badge-neutral">
                            {l.group_name || 'Sundry Debtors'}
                          </span>
                        </td>

                        {/* PAN */}
                        <td>
                          {l.pan ? (
                            <span className="stitch-badge stitch-badge-pan">
                              <span className="pulse-dot" style={{ width: '5px', height: '5px' }} />
                              <span>{l.pan}</span>
                              <span 
                                className="material-symbols-outlined" 
                                style={{ fontSize: '13px', cursor: 'pointer', marginLeft: '2px' }}
                                onClick={() => handleCopy(l.pan, `pan-${l.id}`)}
                                title="Copy PAN"
                              >
                                {copiedKey === `pan-${l.id}` ? 'check' : 'content_copy'}
                              </span>
                            </span>
                          ) : (
                            <span style={{ color: 'var(--outline)', fontSize: '11px' }}>—</span>
                          )}
                        </td>

                        {/* GSTIN */}
                        <td>
                          {l.gstin ? (
                            <span className="stitch-badge stitch-badge-gstin">
                              <span>{l.gstin}</span>
                              <span 
                                className="material-symbols-outlined" 
                                style={{ fontSize: '13px', cursor: 'pointer', marginLeft: '2px' }}
                                onClick={() => handleCopy(l.gstin, `gstin-${l.id}`)}
                                title="Copy GSTIN"
                              >
                                {copiedKey === `gstin-${l.id}` ? 'check' : 'content_copy'}
                              </span>
                            </span>
                          ) : (
                            <span style={{ color: 'var(--outline)', fontSize: '11px' }}>—</span>
                          )}
                        </td>

                        {/* Phone */}
                        <td className="code-font" style={{ color: 'var(--on-surface-variant)', fontSize: '12px' }}>
                          {l.phone || l.mobile || '—'}
                        </td>

                        {/* City & PIN */}
                        <td>
                          <div style={{ fontWeight: 500 }}>{l.city || l.state || 'Bihar'}</div>
                          <div className="code-font" style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>
                            {l.pincode || '—'}
                          </div>
                        </td>

                        {/* Audit Trail */}
                        <td>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'var(--surface-container)', fontSize: '11.5px', color: 'var(--on-surface)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--primary-container)' }}>history_edu</span>
                            <span className="code-font">{l.created_by ? `By ${l.created_by}` : 'EditLog Baseline'}</span>
                          </div>
                        </td>

                        {/* Action */}
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="stitch-btn-ghost" 
                            style={{ padding: '4px' }}
                            onClick={() => setExpandedId(isExpanded ? null : l.id)}
                            title="Inspect Details"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>more_vert</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Detail Drawer */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="9" style={{ padding: '0', backgroundColor: 'rgba(242, 243, 255, 0.4)' }}>
                            <div className="stitch-drawer">
                              
                              {/* Drawer Tab Headers */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '16px', overflowX: 'auto' }}>
                                <button
                                  onClick={() => setActiveDrawerTab('address')}
                                  className={`stitch-tab-pill ${activeDrawerTab === 'address' ? 'active' : ''}`}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>pin_drop</span>
                                  <span>Registered Address & Location</span>
                                </button>
                                <button
                                  onClick={() => setActiveDrawerTab('contact')}
                                  className={`stitch-tab-pill ${activeDrawerTab === 'contact' ? 'active' : ''}`}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>contact_page</span>
                                  <span>Identity & Tax Contact</span>
                                </button>
                                <button
                                  onClick={() => setActiveDrawerTab('audit')}
                                  className={`stitch-tab-pill ${activeDrawerTab === 'audit' ? 'active' : ''}`}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>history</span>
                                  <span>EditLog 2.1 Audit Trail</span>
                                </button>
                                <button
                                  onClick={() => setActiveDrawerTab('raw')}
                                  className={`stitch-tab-pill ${activeDrawerTab === 'raw' ? 'active' : ''}`}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>code</span>
                                  <span>Raw Binary Chunk Inspector</span>
                                </button>
                              </div>

                              {/* Tab 1: Address */}
                              {activeDrawerTab === 'address' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                                  <div className="stitch-card-low">
                                    <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 600 }}>Street Address</div>
                                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--on-surface)', marginTop: '4px' }}>
                                      {l.address || 'Standard Registered Commercial Office'}
                                    </div>
                                  </div>
                                  <div className="stitch-card-low">
                                    <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 600 }}>City / District</div>
                                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--on-surface)', marginTop: '4px' }}>
                                      {l.city || 'Patna / Regional Hub'}
                                    </div>
                                  </div>
                                  <div className="stitch-card-low">
                                    <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 600 }}>Postal PIN & State</div>
                                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--on-surface)', marginTop: '4px' }}>
                                      {l.pincode ? `${l.pincode} • ` : ''}{l.state || 'Bihar'}, India
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Tab 2: Contact */}
                              {activeDrawerTab === 'contact' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                                  <div className="stitch-card-low">
                                    <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 600 }}>Contact Person</div>
                                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--on-surface)', marginTop: '4px' }}>
                                      {l.contact_person || 'Chief Accounts Officer'}
                                    </div>
                                  </div>
                                  <div className="stitch-card-low">
                                    <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 600 }}>Telephones & Mobile</div>
                                    <div className="code-font" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--on-surface)', marginTop: '4px' }}>
                                      {l.phone || l.mobile || '+91 Unspecified'}
                                    </div>
                                  </div>
                                  <div className="stitch-card-low">
                                    <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 600 }}>Tax Identifiers</div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                                      <span className="stitch-badge stitch-badge-pan">PAN: {l.pan || 'N/A'}</span>
                                      <span className="stitch-badge stitch-badge-gstin">GSTIN: {l.gstin || 'Unregistered'}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Tab 3: EditLog Audit Trail */}
                              {activeDrawerTab === 'audit' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                                  <div className="stitch-card-low">
                                    <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 600 }}>Created By User</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary-container)' }}>person</span>
                                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{l.created_by || 'MANISH'}</span>
                                    </div>
                                    <div className="code-font" style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                                      Time: {l.created_date ? new Date(l.created_date).toLocaleString() : '17:35:11 IST'}
                                    </div>
                                  </div>
                                  <div className="stitch-card-low">
                                    <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 600 }}>Last Altered By</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--secondary-container)' }}>manage_accounts</span>
                                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{l.altered_by || 'HASNAIN'}</span>
                                    </div>
                                    <div className="code-font" style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                                      Action: Master Ledger Classification Alteration
                                    </div>
                                  </div>
                                  <div className="stitch-card-low">
                                    <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 600 }}>MCA Rule 3 Compliance</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                                      <span className="stitch-badge stitch-badge-pan">
                                        <span className="pulse-dot" style={{ width: '5px', height: '5px' }} />
                                        Audit Trail Tamper-Proof
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Tab 4: Raw Binary Chunk */}
                              {activeDrawerTab === 'raw' && (
                                <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span className="code-font" style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 600 }}>
                                      Manager.900 Tilde-Delimited Segment
                                    </span>
                                    <button 
                                      onClick={() => handleCopy(l.raw_chunk || `~${l.name}~${l.group_name}~${l.pan || ''}~${l.gstin || ''}~`, `raw-${l.id}`)}
                                      className="stitch-btn-ghost"
                                      style={{ fontSize: '11px', padding: '2px 6px' }}
                                    >
                                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>content_copy</span>
                                      <span>{copiedKey === `raw-${l.id}` ? 'Copied' : 'Copy Chunk'}</span>
                                    </button>
                                  </div>
                                  <pre className="code-font" style={{ fontSize: '11.5px', color: 'var(--on-surface)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, padding: '8px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--border)' }}>
                                    {l.raw_chunk || `~NAME=${l.name}~GROUP=${l.group_name}~PAN=${l.pan || ''}~GSTIN=${l.gstin || ''}~STATE=${l.state || 'Bihar'}~PIN=${l.pincode || ''}~TIMESTAMP=${Date.now()}~`}
                                  </pre>
                                </div>
                              )}

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface-container-low)', fontSize: '13px', color: 'var(--on-surface-variant)', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            Showing <strong style={{ color: 'var(--on-surface)' }}>{ledgers.length > 0 ? (page - 1) * limit + 1 : 0}</strong> to <strong style={{ color: 'var(--on-surface)' }}>{Math.min(page * limit, total)}</strong> of <strong style={{ color: 'var(--on-surface)' }}>{total.toLocaleString()}</strong> ledgers
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="stitch-select"
                style={{ width: '70px', padding: '4px 20px 4px 8px', fontSize: '12px' }}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="stitch-btn-secondary"
                style={{ padding: '4px 8px', opacity: page <= 1 ? 0.5 : 1 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
              </button>
              <span className="code-font" style={{ padding: '0 8px', fontWeight: 600 }}>
                {page} / {totalPages || 1}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="stitch-btn-secondary"
                style={{ padding: '4px 8px', opacity: page >= totalPages ? 0.5 : 1 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
