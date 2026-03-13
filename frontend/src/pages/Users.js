import { USERS } from '@/data';
import { Info } from 'lucide-react';

export default function Users() {
  return (
    <div className="page-content" data-testid="users-page">
      <div className="page-header">
        <div className="page-header-title">Users</div>
        <div className="page-header-sub">{USERS.length} active users</div>
      </div>

      <div className="px-4 py-2 pb-3">
        <div className="bg-accent-orange/10 border border-accent-orange/20 rounded-lg p-3 flex items-start gap-2 text-[13px] text-text-secondary leading-relaxed">
          <Info size={18} className="text-accent-orange flex-shrink-0 mt-0.5" />
          User management is handled by the Administrator. Contact admin to add or remove users.
        </div>
      </div>

      {USERS.map(user => (
        <div key={user.id} className="user-card" data-testid={`user-${user.id}`}>
          <div 
            className="user-avatar"
            style={{ 
              background: user.color + '22', 
              border: `2px solid ${user.color}`, 
              color: user.color 
            }}
          >
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

      <div className="p-5 text-center text-text-muted text-xs">
        Bootlegger Asset Tracker v1.0
        <br />
        <span className="text-accent-orange">bootleggertechnical.coffee</span>
      </div>
    </div>
  );
}
