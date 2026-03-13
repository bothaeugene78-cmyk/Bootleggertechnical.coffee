import { useState } from 'react';
import { SERVICE_RECORDS, GROUPS } from '../data.js';

const sorted = [...SERVICE_RECORDS].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
const typeBadge = t => t === 'Repair' ? 'badge-red' : 'badge-green';
const typeIcon = t => t === 'Repair' ? '🚨' : '📅';

export default function History() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = sorted.filter(r => {
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    const matchGroup = groupFilter === 'all' || r.group === groupFilter;
    const matchSearch = !search ||
      r.assetName.toLowerCase().includes(search.toLowerCase()) ||
      (r.invoice || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.jobCard || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.technician || '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchGroup && matchSearch;
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title">Service History</div>
        <div className="page-header-sub">{SERVICE_RECORDS.length} records loaded · full history in CSV</div>
      </div>

      <div className="search-bar">
        <span>🔍</span>
        <input placeholder="Search store, invoice, job card..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <span style={{ cursor: 'pointer' }} onClick={() => setSearch('')}>✕</span>}
      </div>

      <div className="filter-tabs">
        {[['all','All'],['Service','Services'],['Repair','Repairs']].map(([v,l]) => (
          <button key={v} className={`filter-tab ${typeFilter === v ? 'active' : ''}`} onClick={() => setTypeFilter(v)}>{l}</button>
        ))}
      </div>

      <div className="filter-tabs" style={{ paddingTop: 0 }}>
        {[['all','All Groups'],...GROUPS.map(g => [g.id, g.name])].map(([v,l]) => (
          <button key={v} className={`filter-tab ${groupFilter === v ? 'active' : ''}`} onClick={() => setGroupFilter(v)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">No Records</div>
          <div className="empty-desc">No records match your search.</div>
        </div>
      ) : filtered.map(record => (
        <div key={record.id} className="history-item">
          <div style={{ fontSize: 20 }}>{typeIcon(record.type)}</div>
          <div className="history-content">
            <div className="history-action">{record.assetName}</div>
            <div className="history-detail">{record.type} · Tech: {record.technician} · {record.group}</div>
            {record.notes && <div className="history-detail">{record.notes}</div>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <div className="history-time">📅 {record.date}</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {record.invoice && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{record.invoice}</span>}
                <span className={`list-item-badge ${typeBadge(record.type)}`}>{record.type.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div style={{ padding: '16px 16px 8px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
        Showing {filtered.length} of {SERVICE_RECORDS.length} recent records.
        Full history (1,198 records since 2018) held in source CSV files.
      </div>
    </div>
  );
}
