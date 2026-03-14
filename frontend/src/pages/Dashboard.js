import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { STATS, ASSETS, GROUPS, HISTORY_BY_YEAR, ACTIVITY_12_MONTHS } from '@/data';
import { AlertTriangle, Coffee, ClipboardList, Wrench, Clock, Ticket, CheckCircle, FileText, Loader2 } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

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

export default function Dashboard({ onNavigate }) {
  const { getAuthHeader, user, isAdmin, isTechnician } = useAuth();
  const [ticketStats, setTicketStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const overdue = ASSETS.filter(a => a.status === 'overdue').sort((a, b) => b.daysOverdue - a.daysOverdue).slice(0, 5);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`, {
        headers: getAuthHeader()
      });
      setTicketStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content" data-testid="dashboard-page">

      <div className="dashboard-header">
        <div className="dashboard-date">{today}</div>
        <div className="dashboard-title">
          {isAdmin ? 'Admin Dashboard' : isTechnician ? 'Technician Dashboard' : 'Service Dashboard'}
        </div>
        {user?.store_name && (
          <div className="text-sm text-accent-orange mt-1">{user.store_name}</div>
        )}
      </div>

      {/* Ticket Stats - Main Focus */}
      <div className="px-4 mb-4">
        <div className="text-xs font-semibold tracking-[2px] text-text-muted uppercase mb-3">Service Tickets</div>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-accent-orange" />
          </div>
        ) : ticketStats ? (
          <div className="grid grid-cols-2 gap-3">
            <div 
              className="bg-bg-card rounded-xl p-4 border-t-[3px] border-red-500 cursor-pointer"
              onClick={() => onNavigate('tickets')}
              data-testid="stat-open-tickets"
            >
              <Ticket size={20} className="text-red-400 mb-2" />
              <div className="font-display text-4xl font-bold text-text-primary">{ticketStats.open_tickets}</div>
              <div className="text-[10px] font-semibold tracking-[1.5px] text-text-muted uppercase">Open Tickets</div>
            </div>
            
            <div 
              className="bg-bg-card rounded-xl p-4 border-t-[3px] border-blue-500 cursor-pointer"
              onClick={() => onNavigate('tickets')}
              data-testid="stat-scheduled"
            >
              <Clock size={20} className="text-blue-400 mb-2" />
              <div className="font-display text-4xl font-bold text-text-primary">{ticketStats.scheduled_tickets}</div>
              <div className="text-[10px] font-semibold tracking-[1.5px] text-text-muted uppercase">Scheduled</div>
            </div>
            
            <div 
              className="bg-bg-card rounded-xl p-4 border-t-[3px] border-purple-500 cursor-pointer"
              onClick={() => onNavigate('tickets')}
              data-testid="stat-in-progress"
            >
              <Wrench size={20} className="text-purple-400 mb-2" />
              <div className="font-display text-4xl font-bold text-text-primary">{ticketStats.in_progress}</div>
              <div className="text-[10px] font-semibold tracking-[1.5px] text-text-muted uppercase">In Progress</div>
            </div>
            
            <div 
              className="bg-bg-card rounded-xl p-4 border-t-[3px] border-green-500 cursor-pointer"
              onClick={() => onNavigate('tickets')}
              data-testid="stat-completed"
            >
              <CheckCircle size={20} className="text-green-400 mb-2" />
              <div className="font-display text-4xl font-bold text-text-primary">{ticketStats.completed}</div>
              <div className="text-[10px] font-semibold tracking-[1.5px] text-text-muted uppercase">Completed</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-text-muted text-sm">
            No ticket data available
          </div>
        )}
        
        {ticketStats && ticketStats.invoiced > 0 && (
          <div className="mt-3 bg-bg-card rounded-xl p-4 border-l-[3px] border-accent-orange">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-accent-orange" />
                <span className="text-sm text-text-secondary">Awaiting Invoicing</span>
              </div>
              <span className="font-display text-2xl font-bold text-accent-orange">{ticketStats.invoiced}</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-4">
        <button
          onClick={() => onNavigate('tickets')}
          className="w-full bg-accent-orange text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2"
          data-testid="log-call-btn"
        >
          <Ticket size={20} />
          Log New Service Call
        </button>
      </div>

      {/* Equipment Alert */}
      {STATS.overdueAssets > 0 && (
        <div className="alert-banner mx-4 mb-4" data-testid="alert-banner">
          <AlertTriangle size={24} className="text-red-400 flex-shrink-0" />
          <div className="alert-text">
            <div className="alert-title">Equipment Service Overdue</div>
            <div className="alert-desc">{STATS.overdueAssets} store(s) need scheduled maintenance.</div>
          </div>
          <button className="alert-btn" onClick={() => onNavigate('equipment')} data-testid="alert-view-btn">View</button>
        </div>
      )}

      {/* Asset Stats */}
      <div className="stats-grid px-4" data-testid="stats-grid">
        <div className="stat-card blue" onClick={() => onNavigate('equipment')} data-testid="stat-assets">
          <Coffee size={22} className="stat-icon-svg text-accent-blue" />
          <div className="stat-value">{STATS.totalAssets}</div>
          <div className="stat-label">Total Assets</div>
          <div className="stat-sub text-accent-blue">All Stores</div>
        </div>
        <div className="stat-card red" onClick={() => onNavigate('equipment')} data-testid="stat-overdue">
          <Clock size={22} className="stat-icon-svg text-accent-red" />
          <div className="stat-value">{STATS.overdueAssets}</div>
          <div className="stat-label">Overdue</div>
          <div className="stat-sub text-accent-red">Needs Service</div>
        </div>
      </div>

      {/* Service Alerts - Overdue Equipment */}
      {overdue.length > 0 && (
        <div className="mt-5" data-testid="service-alerts">
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="font-display text-[13px] font-semibold tracking-[2px] text-text-muted uppercase">Equipment Alerts</div>
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
      )}

      {/* Activity Chart */}
      <div className="mx-4 mt-5 bg-bg-card rounded-xl p-4" data-testid="activity-chart">
        <div className="font-display text-[13px] font-semibold tracking-[1.5px] text-text-muted uppercase mb-2">Service History — Last 12 Months</div>
        <BarChart data={ACTIVITY_12_MONTHS} valueKey="count" labelKey="month" height={70} colorFn={() => '#f59c0a'} />
      </div>

    </div>
  );
}
