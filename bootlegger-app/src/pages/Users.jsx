import { USERS } from '../data.js';

export default function Users() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title">Users</div>
        <div className="page-header-sub">{USERS.length} active users</div>
      </div>

      <div style={{ padding: '8px 16px 12px' }}>
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          👤 User management is handled by the Administrator. Contact admin to add or remove users.
        </div>
      </div>

      {USERS.map(user => (
        <div key={user.id} className="user-card">
          <div className="user-avatar" style={{ background: user.color + '22', border: `2px solid ${user.color}`, color: user.color }}>
            {user.initials}
          </div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
          <span className={`list-item-badge ${user.status === 'active' ? 'badge-green' : 'badge-red'}`}>
            {user.status}
          </span>
        </div>
      ))}

      <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
        Bootlegger Asset Tracker v1.0
        <br />
        <span style={{ color: 'var(--accent-orange)' }}>bootleggertechnical.coffee</span>
      </div>
    </div>
  );
}
