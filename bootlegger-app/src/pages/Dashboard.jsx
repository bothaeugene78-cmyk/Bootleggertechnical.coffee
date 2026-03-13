import { STATS, ASSETS, GROUPS, HISTORY_BY_YEAR, ACTIVITY_12_MONTHS } from '../data.js';

function BarChart({ data, valueKey = 'count', labelKey, colorFn, height = 80 }) {
  const max = Math.max(...data.map(d => d[valueKey]));
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${data.length * 28} ${height + 36}`} style={{ width: '100%', minWidth: data.length * 24 }}>
        {data.map((d, i) => {
          const barH = max > 0 ? (d[valueKey] / max) * height : 0;
          const x = i * 28 + 4;
          const y = height - barH;
          const color = colorFn ? colorFn(d) : '#f59c0a';
          const label = d[labelKey] || '';
          const parts = label.split('\n');
          return (
            <g key={i}>
              <rect x={x} y={y} width={20} height={barH} rx={3} fill={color} opacity={0.9} />
              {d[valueKey] > 0 && <text x={x+10} y={y-3} textAnchor="middle" fontSize={7} fill="#9ca3af">{d[valueKey]}</text>}
              {parts.map((p, pi) => (
                <text key={pi} x={x+10} y={height+10+pi*9} textAnchor="middle" fontSize={7} fill="#6b7280">{p}</text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function GroupCard({ group }) {
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '16px', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: group.color, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{group.name}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 700, color: group.color, lineHeight: 1, marginBottom: 6 }}>{group.totalRecords}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{group.services} services · {group.repairs} repairs</div>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const overdue = ASSETS.filter(a => a.status === 'overdue').sort((a, b) => b.daysOverdue - a.daysOverdue);

  return (
    <div className="page-content">

      <div className="dashboard-header">
        <div className="dashboard-date">{today}</div>
        <div className="dashboard-title">Operations Dashboard</div>
      </div>

      {STATS.overdueAssets > 0 && (
        <div className="alert-banner">
          <div className="alert-icon">⚠️</div>
          <div className="alert-text">
            <div className="alert-title">Attention Required</div>
            <div className="alert-desc">{STATS.overdueAssets} store(s) overdue for service.</div>
          </div>
          <button className="alert-btn" onClick={() => onNavigate('equipment')}>View All</button>
        </div>
      )}

      {/* 4-stat grid */}
      <div className="stats-grid">
        <div className="stat-card blue" onClick={() => onNavigate('equipment')}>
          <div className="stat-icon">☕</div>
          <div className="stat-value">{STATS.totalAssets}</div>
          <div className="stat-label">Total Assets</div>
          <div className="stat-sub">BHO · Franchised</div>
        </div>
        <div className="stat-card purple" onClick={() => onNavigate('history')}>
          <div className="stat-icon">📋</div>
          <div className="stat-value">{STATS.totalRecords}</div>
          <div className="stat-label">All Records</div>
          <div className="stat-sub">Since 2018</div>
        </div>
        <div className="stat-card orange" onClick={() => onNavigate('callouts')}>
          <div className="stat-icon">🔧</div>
          <div className="stat-value">{STATS.activeCallouts}</div>
          <div className="stat-label">Active Callouts</div>
          <div className="stat-sub">{STATS.activeCallouts === 0 ? 'All clear' : 'In progress'}</div>
        </div>
        <div className="stat-card red" onClick={() => onNavigate('equipment')}>
          <div className="stat-icon">⏰</div>
          <div className="stat-value">{STATS.overdueAssets}</div>
          <div className="stat-label">Overdue</div>
          <div className="stat-sub">Needs service</div>
        </div>
      </div>

      {/* Due ≤30 days card */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '16px', borderTop: '3px solid var(--accent-green)', display: 'inline-flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#dc2626', borderRadius: 4, padding: '2px 7px' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'white', letterSpacing: 0.5 }}>Next due</span>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 700, lineHeight: 1, color: 'var(--text-primary)', marginBottom: 4 }}>{STATS.dueSoon}</div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase' }}>DUE ≤30 DAYS</div>
        </div>
      </div>

      {/* Full History Chart */}
      <div style={{ margin: '20px 16px 0', background: 'var(--bg-card)', borderRadius: 12, padding: '16px' }}>
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, letterSpacing: 1.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full History — 2018 to Present</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{STATS.totalRecords} total records across {new Date().getFullYear() - 2018 + 1} years</div>
        </div>
        <BarChart data={HISTORY_BY_YEAR} valueKey="count" labelKey="year" height={80} colorFn={(d) => d.isRecent ? '#f59c0a' : '#4f5fa8'} />
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: '#4f5fa8' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Historical (pre-2024)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: '#f59c0a' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Recent (2024+)</span>
          </div>
        </div>
      </div>

      {/* Activity last 12 months */}
      <div style={{ margin: '12px 16px 0', background: 'var(--bg-card)', borderRadius: 12, padding: '16px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, letterSpacing: 1.5, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Activity — Last 12 Months</div>
        <BarChart data={ACTIVITY_12_MONTHS} valueKey="count" labelKey="month" height={70} colorFn={() => '#f59c0a'} />
      </div>

      {/* Groups */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {GROUPS.map(g => <GroupCard key={g.id} group={g} />)}
        </div>
      </div>

      {/* Service Alerts */}
      <div style={{ marginTop: 20 }}>
        <div style={{ padding: '8px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Service Alerts</div>
          <div style={{ fontSize: 12, color: 'var(--accent-orange)', cursor: 'pointer' }} onClick={() => onNavigate('equipment')}>See all</div>
        </div>
        {overdue.map(asset => (
          <div key={asset.id} style={{ margin: '0 16px 8px', background: 'var(--bg-card)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }} onClick={() => onNavigate('equipment')}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{asset.group} · {asset.type}</div>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: '4px 10px', color: '#f87171', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {asset.daysOverdue}D OVERDUE
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
