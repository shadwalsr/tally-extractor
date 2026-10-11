import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './components/Overview';
import LedgerTable from './components/LedgerTable';
import VoucherTimeline from './components/VoucherTimeline';
import ActivityLog from './components/ActivityLog';
import UploadZone from './components/UploadZone';
import CompanyDatasets from './components/CompanyDatasets';
import './App.css';

export default function App() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [currentTab, setCurrentTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadStats(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const loadCompanies = async (targetIdToSelect = null) => {
    try {
      const res = await fetch('/api/companies');
      if (!res.ok) throw new Error('Failed to load companies');
      const data = await res.json();
      setCompanies(data);

      if (data.length > 0) {
        if (targetIdToSelect) {
          setSelectedCompanyId(targetIdToSelect);
        } else if (!selectedCompanyId || !data.some(c => c.id === selectedCompanyId)) {
          setSelectedCompanyId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (companyId) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/companies/${companyId}/stats`);
      if (!res.ok) throw new Error('Failed to load company stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (selectedCompanyId) {
      loadStats(selectedCompanyId);
    }
    loadCompanies(selectedCompanyId);
  };

  const handleIngestionComplete = (newCompanyId) => {
    loadCompanies(newCompanyId);
    if (newCompanyId) {
      setSelectedCompanyId(newCompanyId);
      setCurrentTab('overview');
    }
  };

  const currentCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

  return (
    <div className="app-container">
      <Sidebar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        companies={companies}
        selectedCompanyId={selectedCompanyId}
        setSelectedCompanyId={setSelectedCompanyId}
      />

      <div className="main-content-stitch">
        <Header 
          currentTab={currentTab}
          currentCompany={currentCompany}
          onRefresh={handleRefresh}
          onOpenUpload={() => setCurrentTab('upload')}
          isRefreshing={isRefreshing}
        />

        <main className="content-body-stitch">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--on-surface-variant)' }}>
              <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: 'var(--surface-container-high)', marginBottom: '16px' }}>
                <span className="material-symbols-outlined spin-icon" style={{ fontSize: '32px', color: 'var(--primary-container)' }}>sync</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '6px' }}>
                Connecting to Tally Intelligence Engine...
              </div>
              <div className="code-font" style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                Reading SQLite datastore & binary schemas
              </div>
            </div>
          ) : companies.length === 0 && currentTab !== 'upload' ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: 'var(--surface-container-high)', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--primary-container)' }}>inventory_2</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--on-surface)' }}>No Tally Data Loaded Yet</h2>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginBottom: '20px' }}>
                Ingest your first Tally Prime EditLog dataset to explore master ledgers, sequence vouchers, and MCA Rule 3 audit trails.
              </p>
              <button onClick={() => setCurrentTab('upload')} className="stitch-btn-primary">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload_file</span>
                <span>Ingest Tally Data Folder</span>
              </button>
            </div>
          ) : (
            <>
              {currentTab === 'overview' && (
                <Overview 
                  stats={stats} 
                  company={currentCompany} 
                  onNavigate={setCurrentTab}
                />
              )}

              {currentTab === 'ledgers' && (
                <LedgerTable 
                  companyId={selectedCompanyId}
                  groups={stats ? stats.groups : []}
                />
              )}

              {currentTab === 'vouchers' && (
                <VoucherTimeline 
                  companyId={selectedCompanyId}
                  vouchersByYear={stats ? stats.vouchersByYear : []}
                />
              )}

              {currentTab === 'activity' && (
                <ActivityLog 
                  companyId={selectedCompanyId}
                  topUsers={stats ? stats.topUsers : []}
                />
              )}

              {currentTab === 'upload' && (
                <UploadZone 
                  onIngestionComplete={handleIngestionComplete}
                />
              )}

              {currentTab === 'companies' && (
                <CompanyDatasets 
                  companies={companies}
                  selectedCompanyId={selectedCompanyId}
                  setSelectedCompanyId={setSelectedCompanyId}
                  onNavigate={setCurrentTab}
                  onRefresh={handleRefresh}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
