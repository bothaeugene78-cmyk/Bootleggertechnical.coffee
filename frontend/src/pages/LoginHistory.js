import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Clock, User, Calendar, Loader2 } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

export default function LoginHistory({ onBack }) {
  const { getAuthHeader } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/admin/login-history`, {
        headers: getAuthHeader()
      });
      setHistory(response.data);
    } catch (err) {
      setError('Failed to load login history');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('en-GB', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  return (
    <div className="page-content" data-testid="login-history-page">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        <button 
          onClick={onBack}
          className="bg-bg-card border-none rounded-lg px-3 py-2 text-text-secondary cursor-pointer text-[13px] flex items-center gap-1"
          data-testid="back-btn"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 className="font-display text-xl font-bold">Login History</h1>
          <p className="text-xs text-text-muted">Track all user logins</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-accent-orange" />
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-400">{error}</div>
      ) : history.length === 0 ? (
        <div className="text-center py-20">
          <Clock size={48} className="mx-auto mb-3 text-text-muted" />
          <p className="text-text-muted">No login history yet</p>
        </div>
      ) : (
        <div className="py-3">
          {/* Stats Summary */}
          <div className="px-4 mb-4">
            <div className="bg-bg-card rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-blue/20 flex items-center justify-center">
                <Clock size={24} className="text-accent-blue" />
              </div>
              <div>
                <div className="font-display text-3xl font-bold">{history.length}</div>
                <div className="text-xs text-text-muted uppercase tracking-wider">Total Logins</div>
              </div>
            </div>
          </div>

          {/* Login List */}
          {history.map((entry, index) => {
            const { date, time } = formatDateTime(entry.login_time);
            return (
              <div 
                key={entry.id || index}
                className="mx-4 mb-2 bg-bg-card rounded-lg p-4 flex items-center gap-3"
                data-testid={`login-entry-${index}`}
              >
                <div className="w-10 h-10 rounded-full bg-accent-orange/20 flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-accent-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-text-primary truncate">{entry.user_name}</div>
                  <div className="text-xs text-text-muted truncate">{entry.user_email}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-text-primary font-medium">{time}</div>
                  <div className="text-xs text-text-muted flex items-center gap-1 justify-end">
                    <Calendar size={10} />
                    {date}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
