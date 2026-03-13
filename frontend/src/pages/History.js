import { useState } from 'react';
import { SERVICE_RECORDS, GROUPS } from '@/data';
import { Search, X, Calendar, AlertCircle } from 'lucide-react';

const sorted = [...SERVICE_RECORDS].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
const typeBadge = t => t === 'Repair' ? 'badge-red' : 'badge-green';

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
    <div className="page-content" data-testid="history-page">
      <div className="page-header">
        <div className="page-header-title">Service History</div>
        <div className="page-header-sub">{SERVICE_RECORDS.length} records loaded · full history in CSV</div>
      </div>

      <div className="search-bar" data-testid="history-search">
        <Search size={16} />
        <input placeholder="Search store, invoice, job card..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <X size={16} className="cursor-pointer" onClick={() => setSearch('')} />}
      </div>

      <div className="filter-tabs" data-testid="type-filters">
        {[['all','All'],['Service','Services'],['Repair','Repairs']].map(([v,l]) => (
          <button key={v} className={`filter-tab ${typeFilter === v ? 'active' : ''}`} onClick={() => setTypeFilter(v)}>{l}</button>
        ))}
      </div>

      <div className="filter-tabs pt-0" data-testid="group-filters">
        {[['all','All Groups'],...GROUPS.map(g => [g.id, g.name])].map(([v,l]) => (
          <button key={v} className={`filter-tab ${groupFilter === v ? 'active' : ''}`} onClick={() => setGroupFilter(v)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" data-testid="empty-history">
          <Calendar size={48} className="text-text-muted mx-auto mb-3" />
          <div className="empty-title">No Records</div>
          <div className="empty-desc">No records match your search.</div>
        </div>
      ) : filtered.map(record => (
        <div key={record.id} className="history-item" data-testid={`record-${record.id}`}>
          <div className="text-xl">
            {record.type === 'Repair' ? <AlertCircle size={20} className="text-accent-red" /> : <Calendar size={20} className="text-accent-green" />}
          </div>
          <div className="history-content">
            <div className="history-action">{record.assetName}</div>
            <div className="history-detail">{record.type} · Tech: {record.technician} · {record.group}</div>
            {record.notes && <div className="history-detail">{record.notes}</div>}
            <div className="flex items-center justify-between mt-1">
              <div className="history-time flex items-center gap-1">
                <Calendar size={12} /> {record.date}
              </div>
              <div className="flex gap-1.5 items-center">
                {record.invoice && <span className="text-[11px] text-text-muted">{record.invoice}</span>}
                <span className={`list-item-badge ${typeBadge(record.type)}`}>{record.type.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="p-4 text-center text-xs text-text-muted">
        Showing {filtered.length} of {SERVICE_RECORDS.length} recent records.
        Full history (1,198 records since 2018) held in source CSV files.
      </div>
    </div>
  );
}
