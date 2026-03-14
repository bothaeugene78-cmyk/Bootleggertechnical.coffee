import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Info, Loader2, User, Shield, Wrench, Calculator, Store } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const ROLE_INFO = {
  admin: { icon: Shield, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Administrator' },
  technician: { icon: Wrench, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Technician' },
  accounting: { icon: Calculator, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Accounting' },
  store_staff: { icon: Store, color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Store Staff' }
};

export default function Users({ onBack }) {
  const { getAuthHeader, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`, {
        headers: getAuthHeader()
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`${API}/admin/users/${userId}`, { role: newRole }, {
        headers: getAuthHeader()
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update user');
    }
  };

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  const roleCounts = {
    admin: users.filter(u => u.role === 'admin').length,
    technician: users.filter(u => u.role === 'technician').length,
    accounting: users.filter(u => u.role === 'accounting').length,
    store_staff: users.filter(u => u.role === 'store_staff').length,
  };

  return (
    <div className="page-content" data-testid="users-page">
      {/* Header */}
      {onBack && (
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <button 
            onClick={onBack}
            className="bg-bg-card border-none rounded-lg px-3 py-2 text-text-secondary cursor-pointer text-[13px] flex items-center gap-1"
            data-testid="back-btn"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1 className="font-display text-xl font-bold">Team Members</h1>
            <p className="text-xs text-text-muted">{users.length} users registered</p>
          </div>
        </div>
      )}

      {!onBack && (
        <div className="page-header">
          <div className="page-header-title">Team Members</div>
          <div className="page-header-sub">{users.length} users registered</div>
        </div>
      )}

      {/* Role Filter */}
      <div className="filter-tabs" data-testid="role-filters">
        {[
          ['all', 'All'],
          ['admin', `Admin (${roleCounts.admin})`],
          ['technician', `Techs (${roleCounts.technician})`],
          ['accounting', `Accounting (${roleCounts.accounting})`],
          ['store_staff', `Store (${roleCounts.store_staff})`]
        ].map(([value, label]) => (
          <button
            key={value}
            className={`filter-tab ${filter === value ? 'active' : ''}`}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {isAdmin && (
        <div className="px-4 py-2 pb-3">
          <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-3 flex items-start gap-2 text-[13px] text-text-secondary leading-relaxed">
            <Info size={18} className="text-accent-blue flex-shrink-0 mt-0.5" />
            <span>As admin, you can change user roles by tapping on a user.</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-accent-orange" />
        </div>
      ) : (
        filtered.map(user => {
          const roleInfo = ROLE_INFO[user.role] || ROLE_INFO.store_staff;
          const RoleIcon = roleInfo.icon;
          
          return (
            <div key={user.id} className="mx-4 mb-2 bg-bg-card rounded-xl p-4" data-testid={`user-${user.id}`}>
              <div className="flex items-center gap-3">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${roleInfo.bg}`}
                >
                  <RoleIcon size={24} className={roleInfo.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-text-primary">{user.name}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${roleInfo.bg} ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted truncate">{user.email}</div>
                  {user.store_name && (
                    <div className="text-xs text-accent-orange mt-0.5">{user.store_name}</div>
                  )}
                </div>
              </div>

              {/* Admin Role Selector */}
              {isAdmin && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Change Role</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {Object.entries(ROLE_INFO).map(([role, info]) => (
                      <button
                        key={role}
                        onClick={() => updateUserRole(user.id, role)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                          user.role === role
                            ? `${info.bg} ${info.color} border border-current`
                            : 'bg-bg-primary text-text-muted hover:text-text-secondary'
                        }`}
                      >
                        {info.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      <div className="p-5 text-center text-text-muted text-xs">
        Bootlegger Service Management v2.0
        <br />
        <span className="text-accent-orange">bootleggertechnical.coffee</span>
      </div>
    </div>
  );
}
