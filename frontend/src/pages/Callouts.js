import { useState } from 'react';
import { CALLOUTS, ASSETS } from '@/data';
import { Plus, X } from 'lucide-react';

export default function Callouts() {
  const [filter, setFilter] = useState('all');
  const [showNew, setShowNew] = useState(false);
  const [newCallout, setNewCallout] = useState({ assetId: '', issue: '', priority: 'medium', notes: '' });
  const [callouts, setCallouts] = useState(CALLOUTS);

  const filters = ['all', 'open', 'in-progress', 'closed'];
  const filtered = filter === 'all' ? callouts : callouts.filter(c => c.status === filter);

  const priorityBadge = (p) => {
    if (p === 'high') return 'badge-red';
    if (p === 'medium') return 'badge-orange';
    return 'badge-blue';
  };

  const handleSubmit = () => {
    if (!newCallout.assetId || !newCallout.issue) return;
    const asset = ASSETS.find(a => a.id === newCallout.assetId);
    const callout = {
      id: `C${String(callouts.length + 1).padStart(3, '0')}`,
      assetId: newCallout.assetId,
      assetName: asset?.name || 'Unknown',
      issue: newCallout.issue,
      priority: newCallout.priority,
      status: 'open',
      createdAt: new Date().toISOString(),
      assignedTo: '',
      notes: newCallout.notes,
    };
    setCallouts(prev => [callout, ...prev]);
    setNewCallout({ assetId: '', issue: '', priority: 'medium', notes: '' });
    setShowNew(false);
  };

  return (
    <div className="page-content" data-testid="callouts-page">
      <div className="page-header">
        <div className="page-header-title">Callouts</div>
        <div className="page-header-sub">{callouts.filter(c => c.status === 'open').length} open · {callouts.filter(c => c.status === 'in-progress').length} in progress</div>
      </div>

      <div className="filter-tabs" data-testid="callout-filters">
        {filters.map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" data-testid="empty-callouts">
          <div className="text-5xl mb-3">✅</div>
          <div className="empty-title">No Callouts</div>
          <div className="empty-desc">
            {filter === 'all' ? 'No callouts logged yet. Use the + button to raise one.' : `No ${filter} callouts.`}
          </div>
        </div>
      ) : (
        filtered.map(callout => (
          <div key={callout.id} className="callout-card" data-testid={`callout-${callout.id}`}>
            <div className="callout-header">
              <div className="callout-id">{callout.id}</div>
              <span className={`list-item-badge ${priorityBadge(callout.priority)}`}>
                {callout.priority.toUpperCase()}
              </span>
            </div>
            <div className="callout-body">
              <div className="callout-body-info">
                <div className="callout-asset">{callout.assetName}</div>
                <div className="callout-detail">{callout.issue}</div>
                <div className="callout-detail mt-1">
                  👤 {callout.assignedTo || 'Unassigned'} &nbsp;·&nbsp;
                  {new Date(callout.createdAt).toLocaleDateString('en-GB')}
                </div>
              </div>
              <span className={`list-item-badge ${callout.status === 'open' ? 'badge-red' : callout.status === 'in-progress' ? 'badge-orange' : 'badge-green'}`}>
                {callout.status}
              </span>
            </div>
          </div>
        ))
      )}

      {showNew && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-end" data-testid="new-callout-modal">
          <div className="bg-bg-secondary w-full max-w-[480px] mx-auto rounded-t-2xl p-5 pb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="font-display text-xl font-bold">New Callout</div>
              <button onClick={() => setShowNew(false)} className="text-text-secondary" data-testid="close-callout-modal">
                <X size={20} />
              </button>
            </div>

            <div className="mb-3">
              <label className="text-[11px] text-text-muted tracking-wider uppercase">Asset</label>
              <select 
                className="w-full bg-bg-card border border-border rounded-lg p-2.5 text-text-primary text-sm mt-1"
                value={newCallout.assetId} 
                onChange={e => setNewCallout(p => ({ ...p, assetId: e.target.value }))}
                data-testid="callout-asset-select"
              >
                <option value="">Select asset...</option>
                {ASSETS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div className="mb-3">
              <label className="text-[11px] text-text-muted tracking-wider uppercase">Issue Description</label>
              <textarea 
                className="w-full bg-bg-card border border-border rounded-lg p-2.5 text-text-primary text-sm mt-1 min-h-[80px] resize-none"
                placeholder="Describe the fault..."
                value={newCallout.issue} 
                onChange={e => setNewCallout(p => ({ ...p, issue: e.target.value }))}
                data-testid="callout-issue-input"
              />
            </div>

            <div className="mb-4">
              <label className="text-[11px] text-text-muted tracking-wider uppercase">Priority</label>
              <div className="flex gap-2 mt-1">
                {['low', 'medium', 'high'].map(p => (
                  <button 
                    key={p} 
                    onClick={() => setNewCallout(prev => ({ ...prev, priority: p }))}
                    className={`flex-1 py-2 rounded-lg border text-[13px] font-semibold capitalize transition-colors ${
                      newCallout.priority === p 
                        ? 'border-accent-orange bg-accent-orange/15 text-accent-orange' 
                        : 'border-border bg-bg-card text-text-muted'
                    }`}
                    data-testid={`priority-${p}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5">
              <button 
                onClick={() => setShowNew(false)} 
                className="flex-1 py-3 rounded-lg border border-border text-text-secondary font-semibold"
                data-testid="cancel-callout-btn"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit} 
                className="flex-[2] py-3 rounded-lg bg-accent-orange text-black font-bold"
                data-testid="submit-callout-btn"
              >
                Submit Callout
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="fab" onClick={() => setShowNew(true)} data-testid="add-callout-btn">
        <Plus size={24} />
      </button>
    </div>
  );
}
