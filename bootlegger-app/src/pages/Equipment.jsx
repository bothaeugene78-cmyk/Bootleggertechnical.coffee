import { useState } from 'react';
import { ASSETS, GROUPS } from '../data.js';

const statusColor = s => s === 'overdue' ? 'badge-red' : s === 'due-soon' ? 'badge-orange' : s === 'unknown' ? 'badge-blue' : 'badge-green';
const statusLabel = s => s === 'overdue' ? 'OVERDUE' : s === 'due-soon' ? 'DUE SOON' : s === 'unknown' ? 'NO DATE' : 'OK';
const borderColor = s => s === 'overdue' ? '#ef4444' : s === 'due-soon' ? '#f59e0b' : 'transparent';

function AssetDetail({ asset, onClose }) {
  const machines = [
    asset.machine1 && { label: 'Machine 1', value: asset.machine1, casm: asset.casm1 },
    asset.machine2 && { label: 'Machine 2', value: asset.machine2, casm: asset.casm2 },
  ].filter(Boolean);
  const grinders = [
    asset.grinder1 && { label: 'Grinder 1', value: asset.grinder1, casm: asset.gcasm1 },
    asset.grinder2 && { label: 'Grinder 2', value: asset.grinder2, casm: asset.gcasm2 },
    asset.grinder3 && { label: 'Grinder 3', value: asset.grinder3 },
  ].filter(Boolean);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: 'var(--bg-secondary)', width: '100%', maxWidth: 480, margin: '0 auto', borderRadius: '16px 16px 0 0', padding: '20px 16px 36px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>{asset.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{asset.group} · {asset.type} · {asset.id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-card)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Last Service', value: asset.lastService || 'N/A' },
            { label: 'Next Due', value: asset.nextService || 'Not set' },
            { label: 'Service Ref', value: asset.lastServiceRef || 'N/A' },
            { label: 'Status', value: statusLabel(asset.status) },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: s.label === 'Next Due' && asset.status === 'overdue' ? 'var(--accent-red)' : 'var(--text-primary)' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {machines.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Machines</div>
            {machines.map(m => (
              <div key={m.label} style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 12px', marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{m.value}</div>
                {m.casm && <div style={{ fontSize: 11, color: 'var(--accent-orange)', marginTop: 2 }}>CASM: {m.casm}</div>}
              </div>
            ))}
          </div>
        )}

        {grinders.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Grinders</div>
            {grinders.map(g => (
              <div key={g.label} style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 12px', marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{g.value}</div>
                {g.casm && <div style={{ fontSize: 11, color: 'var(--accent-orange)', marginTop: 2 }}>CASM: {g.casm}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Equipment() {
  const [filter, setFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = ASSETS.filter(a => {
    const matchStatus = filter === 'all' || a.status === filter;
    const matchGroup = groupFilter === 'all' || a.group === groupFilter;
    const matchSearch = !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.machine1 || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.group || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchGroup && matchSearch;
  });

  const overdueCount = ASSETS.filter(a => a.status === 'overdue').length;
  const dueSoonCount = ASSETS.filter(a => a.status === 'due-soon').length;

  return (
    <div className="page-content">
      {selected && <AssetDetail asset={selected} onClose={() => setSelected(null)} />}

      <div className="page-header">
        <div className="page-header-title">Equipment</div>
        <div className="page-header-sub">{ASSETS.length} stores · {overdueCount} overdue · {dueSoonCount} due soon</div>
      </div>

      <div className="search-bar">
        <span>🔍</span>
        <input placeholder="Search stores or machines..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <span style={{ cursor: 'pointer' }} onClick={() => setSearch('')}>✕</span>}
      </div>

      <div className="filter-tabs">
        {[['all','All'],['overdue',`Overdue (${overdueCount})`],['due-soon',`Due Soon (${dueSoonCount})`],['ok','OK']].map(([v, l]) => (
          <button key={v} className={`filter-tab ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      <div className="filter-tabs" style={{ paddingTop: 0 }}>
        {[['all','All Groups'],...GROUPS.map(g => [g.id, g.name])].map(([v, l]) => (
          <button key={v} className={`filter-tab ${groupFilter === v ? 'active' : ''}`} onClick={() => setGroupFilter(v)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No Stores Found</div>
          <div className="empty-desc">Try adjusting your search or filter.</div>
        </div>
      ) : filtered.map(asset => (
        <div key={asset.id} onClick={() => setSelected(asset)}
          style={{ margin: '0 16px 8px', background: 'var(--bg-card)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderLeft: `3px solid ${borderColor(asset.status)}`, cursor: 'pointer' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{asset.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {asset.group} · {asset.type}
              {asset.machine1 ? ` · ${asset.machine1.replace(' 2grp','').replace(' 3grp','').trim()}` : ''}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
              Next: {asset.nextService || 'Not scheduled'}
              {asset.daysOverdue > 0 ? ` · ${asset.daysOverdue}d overdue` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <span className={`list-item-badge ${statusColor(asset.status)}`}>{statusLabel(asset.status)}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{asset.id}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
