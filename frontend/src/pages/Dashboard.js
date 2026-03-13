import { STATS, ASSETS, GROUPS, HISTORY_BY_YEAR, ACTIVITY_12_MONTHS } from '@/data';
import { AlertTriangle, Coffee, ClipboardList, Wrench, Clock } from 'lucide-react';

function BarChart({ data, valueKey = 'count', labelKey, colorFn, height = 80 }) {
  const max = Math.max(...data.map(d => d[valueKey]));
  return (
    <div className="w-full overflow-x-auto">
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
    <div className="bg-bg-card rounded-xl p-4 flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: group.color }} />
        <span className="text-[13px] font-semibold text-text-secondary">{group.name}</span>
      </div>
      <div className="font-display text-[38px] font-bold leading-none mb-1.5" style={{ color: group.color }}>{group.totalRecords}</div>
      <div className="text-xs text-text-muted">{group.services} services · {group.repairs} repairs</div>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const overdue = ASSETS.filter(a => a.status === 'overdue').sort((a, b) => b.daysOverdue - a.daysOverdue);

  return (
    <div className="page-content" data-testid="dashboard-page">

      <div className="dashboard-header">
        <div className="dashboard-date">{today}</div>
        <div className="dashboard-title">Operations Dashboard</div>
      </div>

      {STATS.overdueAssets > 0 && (
        <div className="alert-banner" data-testid="alert-banner">
          <AlertTriangle size={24} className="text-red-400 flex-shrink-0" />
          <div className="alert-text">
            <div className="alert-title">Attention Required</div>
            <div className="alert-desc">{STATS.overdueAssets} store(s) overdue for service.</div>
          </div>
          <button className="alert-btn" onClick={() => onNavigate('equipment')} data-testid="alert-view-btn">View All</button>
        </div>
      )}

      {/* 4-stat grid */}
      <div className="stats-grid" data-testid="stats-grid">
        <div className="stat-card blue" onClick={() => onNavigate('equipment')} data-testid="stat-assets">
          <Coffee size={22} className="stat-icon-svg text-accent-blue" />
          <div className="stat-value">{STATS.totalAssets}</div>
          <div className="stat-label">Total Assets</div>
          <div className="stat-sub text-accent-blue">BHO · Franchised</div>
        </div>
        <div className="stat-card purple" onClick={() => onNavigate('history')} data-testid="stat-records">
          <ClipboardList size={22} className="stat-icon-svg text-accent-purple" />
          <div className="stat-value">{STATS.totalRecords}</div>
          <div className="stat-label">All Records</div>
          <div className="stat-sub text-accent-purple">Since 2018</div>
        </div>
        <div className="stat-card orange" onClick={() => onNavigate('callouts')} data-testid="stat-callouts">
          <Wrench size={22} className="stat-icon-svg text-accent-orange" />
          <div className="stat-value">{STATS.activeCallouts}</div>
          <div className="stat-label">Active Callouts</div>
          <div className="stat-sub text-accent-orange">{STATS.activeCallouts === 0 ? 'All clear' : 'In progress'}</div>
        </div>
        <div className="stat-card red" onClick={() => onNavigate('equipment')} data-testid="stat-overdue">
          <Clock size={22} className="stat-icon-svg text-accent-red" />
          <div className="stat-value">{STATS.overdueAssets}</div>
          <div className="stat-label">Overdue</div>
          <div className="stat-sub text-accent-red">Needs service</div>
        </div>
      </div>

      {/* Due ≤30 days card */}
      <div className="px-4 pt-5">
        <div className="bg-bg-card rounded-xl p-4 border-t-[3px] border-accent-green inline-flex flex-col">
          <div className="mb-1.5">
            <div className="inline-flex items-center gap-1 bg-red-600 rounded px-2 py-0.5">
              <span className="text-[10px] font-bold text-white tracking-wider">Next due</span>
            </div>
          </div>
          <div className="font-display text-[44px] font-bold leading-none text-text-primary mb-1">{STATS.dueSoon}</div>
          <div className="text-[10px] font-semibold tracking-[2px] text-text-muted uppercase">DUE ≤30 DAYS</div>
        </div>
      </div>

      {/* Full History Chart */}
      <div className="mx-4 mt-5 bg-bg-card rounded-xl p-4" data-testid="history-chart">
        <div className="mb-1">
          <div className="font-display text-[13px] font-semibold tracking-[1.5px] text-text-muted uppercase">Full History — 2018 to Present</div>
          <div className="text-xs text-text-muted mt-0.5">{STATS.totalRecords} total records across {new Date().getFullYear() - 2018 + 1} years</div>
        </div>
        <BarChart data={HISTORY_BY_YEAR} valueKey="count" labelKey="year" height={80} colorFn={(d) => d.isRecent ? '#f59c0a' : '#4f5fa8'} />
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#4f5fa8]" />
            <span className="text-[11px] text-text-muted">Historical (pre-2024)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-brand-gold" />
            <span className="text-[11px] text-text-muted">Recent (2024+)</span>
          </div>
        </div>
      </div>

      {/* Activity last 12 months */}
      <div className="mx-4 mt-3 bg-bg-card rounded-xl p-4" data-testid="activity-chart">
        <div className="font-display text-[13px] font-semibold tracking-[1.5px] text-text-muted uppercase mb-2">Activity — Last 12 Months</div>
        <BarChart data={ACTIVITY_12_MONTHS} valueKey="count" labelKey="month" height={70} colorFn={() => '#f59c0a'} />
      </div>

      {/* Groups */}
      <div className="px-4 pt-5">
        <div className="flex gap-3" data-testid="groups-section">
          {GROUPS.map(g => <GroupCard key={g.id} group={g} />)}
        </div>
      </div>

      {/* Service Alerts */}
      <div className="mt-5" data-testid="service-alerts">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="font-display text-[13px] font-semibold tracking-[2px] text-text-muted uppercase">Service Alerts</div>
          <div className="text-xs text-accent-orange cursor-pointer" onClick={() => onNavigate('equipment')}>See all</div>
        </div>
        {overdue.map(asset => (
          <div 
            key={asset.id} 
            className="mx-4 mb-2 bg-bg-card rounded-lg p-3.5 flex items-center gap-3 border border-red-500/20 cursor-pointer"
            onClick={() => onNavigate('equipment')}
            data-testid={`alert-${asset.id}`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-accent-red flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">{asset.name}</div>
              <div className="text-xs text-text-muted">{asset.group} · {asset.type}</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-full px-2.5 py-1 text-red-400 text-[11px] font-bold whitespace-nowrap flex-shrink-0">
              {asset.daysOverdue}D OVERDUE
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
