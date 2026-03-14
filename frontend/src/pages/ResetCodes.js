import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, KeyRound, User, Clock, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

export default function ResetCodes({ onBack }) {
  const { getAuthHeader } = useAuth();
  const [users, setUsers] = useState([]);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [newCode, setNewCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, codesRes] = await Promise.all([
        axios.get(`${API}/admin/users`, { headers: getAuthHeader() }),
        axios.get(`${API}/admin/reset-codes`, { headers: getAuthHeader() })
      ]);
      setUsers(usersRes.data);
      setCodes(codesRes.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    if (!selectedEmail) {
      setError('Please select a user');
      return;
    }

    setGenerating(true);
    setError('');
    setNewCode(null);

    try {
      const response = await axios.post(
        `${API}/auth/generate-reset-code`,
        { email: selectedEmail },
        { headers: getAuthHeader() }
      );
      setNewCode(response.data);
      fetchData(); // Refresh codes list
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate reset code');
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = () => {
    if (newCode?.reset_code) {
      navigator.clipboard.writeText(newCode.reset_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt) => {
    return new Date() > new Date(expiresAt);
  };

  return (
    <div className="page-content" data-testid="reset-codes-page">
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
          <h1 className="font-display text-xl font-bold">Password Reset</h1>
          <p className="text-xs text-text-muted">Generate reset codes for users</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-accent-orange" />
        </div>
      ) : (
        <div className="py-4">
          {/* Generate Code Section */}
          <div className="px-4 mb-6">
            <div className="bg-bg-card rounded-xl p-4 border border-border">
              <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
                <KeyRound size={20} className="text-accent-orange" />
                Generate Reset Code
              </h3>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3 flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}

              <div className="mb-3">
                <label className="text-xs text-text-muted uppercase tracking-wider mb-1 block">Select User</label>
                <select
                  value={selectedEmail}
                  onChange={(e) => setSelectedEmail(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-lg py-2.5 px-3 text-text-primary text-sm"
                  data-testid="user-select"
                >
                  <option value="">Choose a user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.email}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={generateCode}
                disabled={generating || !selectedEmail}
                className="w-full bg-accent-orange text-black font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="generate-btn"
              >
                {generating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <KeyRound size={18} />
                    Generate Code
                  </>
                )}
              </button>

              {/* Show Generated Code */}
              {newCode && (
                <div className="mt-4 p-4 bg-accent-green/10 border border-accent-green/30 rounded-lg">
                  <div className="text-xs text-accent-green uppercase tracking-wider mb-2">New Reset Code</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-bg-primary rounded-lg p-3 font-mono text-2xl text-center tracking-[0.5em] text-accent-orange">
                      {newCode.reset_code}
                    </div>
                    <button
                      onClick={copyCode}
                      className="bg-bg-primary p-3 rounded-lg text-text-secondary hover:text-accent-orange transition-colors"
                      data-testid="copy-btn"
                    >
                      {copied ? <Check size={20} className="text-accent-green" /> : <Copy size={20} />}
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-text-muted">
                    For: {newCode.email} • Expires: {formatDateTime(newCode.expires_at)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Codes List */}
          <div className="px-4">
            <h3 className="font-display text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
              Recent Reset Codes
            </h3>

            {codes.length === 0 ? (
              <div className="text-center py-8 text-text-muted text-sm">
                No reset codes generated yet
              </div>
            ) : (
              codes.map((code, index) => {
                const expired = isExpired(code.expires_at);
                return (
                  <div 
                    key={code.id || index}
                    className={`bg-bg-card rounded-lg p-4 mb-2 border ${
                      code.used ? 'border-green-500/30' : 
                      expired ? 'border-red-500/30' : 
                      'border-border'
                    }`}
                    data-testid={`code-entry-${index}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-text-muted" />
                        <span className="text-sm text-text-primary">{code.email}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        code.used ? 'bg-green-500/20 text-green-400' :
                        expired ? 'bg-red-500/20 text-red-400' :
                        'bg-accent-orange/20 text-accent-orange'
                      }`}>
                        {code.used ? 'USED' : expired ? 'EXPIRED' : 'ACTIVE'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-lg tracking-widest text-text-secondary">
                        {code.reset_code}
                      </div>
                      <div className="text-xs text-text-muted flex items-center gap-1">
                        <Clock size={12} />
                        {formatDateTime(code.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
