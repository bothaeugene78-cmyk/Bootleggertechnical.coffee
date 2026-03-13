import { useState } from 'react';
import { ASSETS, GROUPS } from '@/data';
import { Search, X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/85 z-[200] flex items-end" data-testid="asset-detail-modal">
      <div className="bg-bg-secondary w-full max-w-[480px] mx-auto rounded-t-2xl p-5 pb-9 max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="font-display text-[22px] font-bold">{asset.name}</div>
            <div className="text-xs text-text-muted mt-0.5">{asset.group} · {asset.type} · {asset.id}</div>
          </div>
          <button onClick={onClose} className="bg-bg-card border-none rounded-lg px-3 py-1.5 text-text-secondary cursor-pointer text-[13px]" data-testid="close-detail-btn">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {[
            { label: 'Last Service', value: asset.lastService || 'N/A' },
            { label: 'Next Due', value: asset.nextService || 'Not set' },
            { label: 'Service Ref', value: asset.lastServiceRef || 'N/A' },
            { label: 'Status', value: statusLabel(asset.status) },
          ].map(s => (
            <div key={s.label} className="bg-bg-primary rounded-lg p-2.5">
              <div className="text-[10px] text-text-muted tracking-wider uppercase mb-0.5">{s.label}</div>
              <div className={`text-sm font-semibold ${s.label === 'Next Due' && asset.status === 'overdue' ? 'text-accent-red' : 'text-text-primary'}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {machines.length > 0 && (
          <div className="mb-3">
            <div className="text-[11px] font-semibold tracking-[1.5px] text-text-muted uppercase mb-2">Machines</div>
            {machines.map(m => (
              <div key={m.label} className="bg-bg-primary rounded-lg p-2.5 mb-1.5">
                <div className="text-[11px] text-text-muted">{m.label}</div>
                <div className="text-sm font-semibold">{m.value}</div>
                {m.casm && <div className="text-[11px] text-accent-orange mt-0.5">CASM: {m.casm}</div>}
              </div>
            ))}
          </div>
        )}

        {grinders.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold tracking-[1.5px] text-text-muted uppercase mb-2">Grinders</div>
            {grinders.map(g => (
              <div key={g.label} className="bg-bg-primary rounded-lg p-2.5 mb-1.5">
                <div className="text-[11px] text-text-muted">{g.label}</div>
                <div className="text-sm font-semibold">{g.value}</div>
                {g.casm && <div className="text-[11px] text-accent-orange mt-0.5">CASM: {g.casm}</div>}
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
    <div className="page-content" data-testid="equipment-page">
      {selected && <AssetDetail asset={selected} onClose={() => setSelected(null)} />}

      <div className="page-header">
        <div className="page-header-title">Equipment</div>
        <div className="page-header-sub">{ASSETS.length} stores · {overdueCount} overdue · {dueSoonCount} due soon</div>
      </div>

      <div className="search-bar" data-testid="equipment-search">
        <Search size={16} />
        <input placeholder="Search stores or machines..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <X size={16} className="cursor-pointer" onClick={() => setSearch('')} />}
      </div>

      <div className="filter-tabs" data-testid="status-filters">
        {[['all','All'],['overdue',`Overdue (${overdueCount})`],['due-soon',`Due Soon (${dueSoonCount})`],['ok','OK']].map(([v, l]) => (
          <button key={v} className={`filter-tab ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      <div className="filter-tabs pt-0" data-testid="group-filters">
        {[['all','All Groups'],...GROUPS.map(g => [g.id, g.name])].map(([v, l]) => (
          <button key={v} className={`filter-tab ${groupFilter === v ? 'active' : ''}`} onClick={() => setGroupFilter(v)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" data-testid="empty-state">
          <Search size={48} className="text-text-muted mx-auto mb-3" />
          <div className="empty-title">No Stores Found</div>
          <div className="empty-desc">Try adjusting your search or filter.</div>
        </div>
      ) : filtered.map(asset => (
        <div 
          key={asset.id} 
          onClick={() => setSelected(asset)}
          className="mx-4 mb-2 bg-bg-card rounded-lg p-3.5 flex items-center gap-3 cursor-pointer"
          style={{ borderLeft: `3px solid ${borderColor(asset.status)}` }}
          data-testid={`asset-${asset.id}`}
        >
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-text-primary">{asset.name}</div>
            <div className="text-[11px] text-text-muted mt-0.5">
              {asset.group} · {asset.type}
              {asset.machine1 ? ` · ${asset.machine1.replace(' 2grp','').replace(' 3grp','').trim()}` : ''}
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">
              Next: {asset.nextService || 'Not scheduled'}
              {asset.daysOverdue > 0 ? ` · ${asset.daysOverdue}d overdue` : ''}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`list-item-badge ${statusColor(asset.status)}`}>{statusLabel(asset.status)}</span>
            <span className="text-[10px] text-text-muted">{asset.id}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
