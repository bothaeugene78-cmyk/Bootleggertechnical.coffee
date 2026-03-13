import { useState } from 'react';
import { CALLOUTS, ASSETS } from '../data.js';

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
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title">Callouts</div>
        <div className="page-header-sub">{callouts.filter(c => c.status === 'open').length} open · {callouts.filter(c => c.status === 'in-progress').length} in progress</div>
      </div>

      <div className="filter-tabs">
        {filters.map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <div className="empty-title">No Callouts</div>
          <div className="empty-desc">
            {filter === 'all' ? 'No callouts logged yet. Use the + button to raise one.' : `No ${filter} callouts.`}
          </div>
        </div>
      ) : (
        filtered.map(callout => (
          <div key={callout.id} className="callout-card">
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
                <div className="callout-detail" style={{ marginTop: 4 }}>
                  {callout.assignedTo ? `👤 ${callout.assignedTo}` : '👤 Unassigned'} &nbsp;·&nbsp;
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'var(--bg-secondary)', width: '100%', maxWidth: 480, margin: '0 auto', borderRadius: '16px 16px 0 0', padding: '20px 16px 32px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>New Callout</div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>Asset</label>
              <select style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 14, marginTop: 4 }}
                value={newCallout.assetId} onChange={e => setNewCallout(p => ({ ...p, assetId: e.target.value }))}>
                <option value="">Select asset...</option>
                {ASSETS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>Issue Description</label>
              <textarea style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 14, marginTop: 4, minHeight: 80, resize: 'none' }}
                placeholder="Describe the fault..."
                value={newCallout.issue} onChange={e => setNewCallout(p => ({ ...p, issue: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>Priority</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {['low', 'medium', 'high'].map(p => (
                  <button key={p} onClick={() => setNewCallout(prev => ({ ...prev, priority: p }))}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: `1px solid ${newCallout.priority === p ? 'var(--accent-orange)' : 'var(--border)'}`, background: newCallout.priority === p ? 'rgba(245,158,11,0.15)' : 'var(--bg-card)', color: newCallout.priority === p ? 'var(--accent-orange)' : 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowNew(false)} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: '1px solid var(--border)', background: 'none', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} style={{ flex: 2, padding: '12px 0', borderRadius: 10, border: 'none', background: 'var(--accent-orange)', color: '#000', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Submit Callout</button>
            </div>
          </div>
        </div>
      )}

      <button className="fab" onClick={() => setShowNew(true)}>+</button>
    </div>
  );
}
