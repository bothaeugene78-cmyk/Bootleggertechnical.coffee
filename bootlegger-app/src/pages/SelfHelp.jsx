import { useState } from 'react';
import { SELF_HELP_GUIDES } from '../data.js';

export default function SelfHelp() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const categories = ['all', ...new Set(SELF_HELP_GUIDES.map(g => g.category))];
  const filtered = filter === 'all' ? SELF_HELP_GUIDES : SELF_HELP_GUIDES.filter(g => g.category === filter);

  const catColor = (c) => {
    if (c === 'Cleaning') return { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' };
    if (c === 'Maintenance') return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' };
    if (c === 'Inspection') return { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' };
    return { bg: 'rgba(16,185,129,0.15)', color: '#10b981' };
  };

  if (selected) {
    const guide = SELF_HELP_GUIDES.find(g => g.id === selected);
    const color = catColor(guide.category);
    return (
      <div className="page-content">
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setSelected(null)} style={{ background: 'var(--bg-card)', border: 'none', borderRadius: 8, padding: '8px 12px', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13 }}>← Back</button>
        </div>

        <div style={{ padding: '0 16px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{guide.icon}</div>
          <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: color.bg, color: color.color, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>{guide.category}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{guide.title}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>{guide.desc}</div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, letterSpacing: 1, marginBottom: 14, textTransform: 'uppercase' }}>Steps</div>

          {guide.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: color.bg, color: color.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, paddingTop: 4 }}>{step}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title">Self-Help</div>
        <div className="page-header-sub">{SELF_HELP_GUIDES.length} guides available</div>
      </div>

      <div className="filter-tabs">
        {categories.map(c => (
          <button key={c} className={`filter-tab ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
            {c === 'all' ? 'All Guides' : c}
          </button>
        ))}
      </div>

      {filtered.map(guide => {
        const color = catColor(guide.category);
        return (
          <div key={guide.id} className="help-card" onClick={() => setSelected(guide.id)}>
            <div className="help-icon" style={{ background: color.bg }}>
              {guide.icon}
            </div>
            <div className="help-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div className="help-title">{guide.title}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: color.bg, color: color.color, fontWeight: 600, letterSpacing: 0.5 }}>{guide.category}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{guide.steps.length} steps</span>
              </div>
              <div className="help-desc">{guide.desc}</div>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 16 }}>›</div>
          </div>
        );
      })}
    </div>
  );
}
