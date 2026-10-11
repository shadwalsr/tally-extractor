import React from 'react';
import { BookOpen, Receipt, CreditCard, ShieldCheck, UserCheck, Percent } from 'lucide-react';

export default function StatsCards({ stats }) {
  if (!stats) return null;

  const panPercent = stats.ledgerCount > 0 
    ? Math.round((stats.panCount / stats.ledgerCount) * 100) 
    : 0;

  const gstPercent = stats.ledgerCount > 0 
    ? Math.round((stats.gstCount / stats.ledgerCount) * 100) 
    : 0;

  const cards = [
    {
      title: 'Total Ledgers',
      value: stats.ledgerCount.toLocaleString(),
      subtext: `${stats.groups ? stats.groups.length : 0} account groups`,
      icon: BookOpen,
      gradient: 'var(--gradient-primary)',
      glow: 'rgba(99, 102, 241, 0.2)'
    },
    {
      title: 'Voucher Records',
      value: stats.voucherCount.toLocaleString(),
      subtext: `${stats.vouchersByYear ? stats.vouchersByYear.length : 0} fiscal years captured`,
      icon: Receipt,
      gradient: 'var(--gradient-cyan)',
      glow: 'rgba(6, 182, 212, 0.2)'
    },
    {
      title: 'PAN Identified',
      value: stats.panCount.toLocaleString(),
      subtext: `${panPercent}% ledger coverage`,
      icon: CreditCard,
      gradient: 'var(--gradient-emerald)',
      glow: 'rgba(16, 185, 129, 0.2)'
    },
    {
      title: 'GST Registrations',
      value: stats.gstCount.toLocaleString(),
      subtext: `${gstPercent}% verified GSTINs`,
      icon: ShieldCheck,
      gradient: 'var(--gradient-amber)',
      glow: 'rgba(245, 158, 11, 0.2)'
    },
    {
      title: 'Audit Operators',
      value: stats.userCount.toLocaleString(),
      subtext: 'Session activities parsed',
      icon: UserCheck,
      gradient: 'var(--gradient-rose)',
      glow: 'rgba(244, 63, 94, 0.2)'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    }}>
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div 
            key={i} 
            className="glass-card" 
            style={{ 
              padding: '22px', 
              position: 'relative', 
              overflow: 'hidden',
              boxShadow: `0 8px 24px ${c.glow}`
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-15px',
              right: '-15px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: c.gradient,
              opacity: 0.1,
              filter: 'blur(20px)',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {c.title}
              </span>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: c.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${c.glow}`
              }}>
                <Icon size={18} color="#fff" />
              </div>
            </div>

            <div style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {c.value}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 500 }}>
              {c.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
