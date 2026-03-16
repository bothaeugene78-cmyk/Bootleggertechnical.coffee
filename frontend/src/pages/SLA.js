import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ASSETS } from '@/data';
import { 
  Shield, Check, Crown, Star, Loader2, AlertCircle, ArrowLeft,
  CreditCard, Users, Calendar, X, CheckCircle
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const PLAN_STYLES = {
  silver: { 
    border: 'border-gray-400', 
    bg: 'bg-gradient-to-b from-gray-500/10 to-gray-600/5',
    accent: 'text-gray-300',
    badge: 'bg-gray-500/20 text-gray-300',
    icon: Shield
  },
  gold: { 
    border: 'border-amber-500', 
    bg: 'bg-gradient-to-b from-amber-500/10 to-amber-600/5',
    accent: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-400',
    icon: Star
  },
  platinum: { 
    border: 'border-cyan-400', 
    bg: 'bg-gradient-to-b from-cyan-500/10 to-cyan-600/5',
    accent: 'text-cyan-300',
    badge: 'bg-cyan-500/20 text-cyan-300',
    icon: Crown
  }
};

const STATUS_STYLES = {
  active: 'bg-green-500/20 text-green-400',
  pending: 'bg-orange-500/20 text-orange-400',
  cancelled: 'bg-red-500/20 text-red-400',
  expired: 'bg-gray-500/20 text-gray-400'
};

function PlanCard({ plan, onSubscribe, loading, currentPlan }) {
  const style = PLAN_STYLES[plan.id] || PLAN_STYLES.silver;
  const Icon = style.icon;
  const isCurrent = currentPlan === plan.id;
  
  return (
    <div className={`rounded-xl border-2 ${style.border} ${style.bg} p-5 relative`} data-testid={`plan-${plan.id}`}>
      {plan.id === 'gold' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
          Popular
        </div>
      )}
      <div className="flex items-center gap-2 mb-3">
        <Icon size={22} className={style.accent} />
        <span className={`font-display text-lg font-bold ${style.accent}`}>{plan.name}</span>
      </div>
      <div className="mb-4">
        <span className="font-display text-3xl font-bold text-text-primary">{plan.price_display}</span>
      </div>
      <div className="text-xs text-text-muted mb-4 space-y-1.5">
        <div className="flex items-center gap-2"><Check size={14} className={style.accent} /> Monthly SLA coverage</div>
        <div className="flex items-center gap-2"><Check size={14} className={style.accent} /> Priority service response</div>
        <div className="flex items-center gap-2"><Check size={14} className={style.accent} /> Dedicated support</div>
      </div>
      {isCurrent ? (
        <div className="w-full py-2.5 rounded-lg bg-green-500/20 text-green-400 text-center text-sm font-semibold flex items-center justify-center gap-2">
          <CheckCircle size={16} /> Active Plan
        </div>
      ) : (
        <button
          onClick={() => onSubscribe(plan.id)}
          disabled={loading}
          className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${
            plan.id === 'gold' 
              ? 'bg-amber-500 text-black hover:bg-amber-400' 
              : 'bg-bg-primary border border-border text-text-primary hover:border-accent-orange'
          } disabled:opacity-50`}
          data-testid={`subscribe-${plan.id}`}
        >
          {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Subscribe'}
        </button>
      )}
    </div>
  );
}

function AdminAssignModal({ onClose, onAssigned }) {
  const { getAuthHeader } = useAuth();
  const [store, setStore] = useState('');
  const [planId, setPlanId] = useState('gold');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAssign = async () => {
    if (!store) { setError('Select a store'); return; }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/sla/manual-assign`, {
        store_name: store,
        plan_id: planId,
        notes: notes || null
      }, { headers: getAuthHeader() });
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to assign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-[200] flex items-end" data-testid="assign-sla-modal">
      <div className="bg-bg-secondary w-full max-w-[480px] mx-auto rounded-t-2xl p-5 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="font-display text-xl font-bold">Assign SLA Plan</div>
          <button onClick={onClose} className="text-text-secondary"><X size={20} /></button>
        </div>
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-1 block">Store</label>
            <select
              value={store}
              onChange={(e) => setStore(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-lg py-3 px-4 text-text-primary"
              data-testid="assign-store-select"
            >
              <option value="">Select store...</option>
              {ASSETS.map(s => (
                <option key={s.id} value={s.name}>{s.name} ({s.group})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-1 block">Plan</label>
            <div className="flex gap-2">
              {['silver', 'gold', 'platinum'].map(p => (
                <button
                  key={p}
                  onClick={() => setPlanId(p)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-semibold capitalize ${
                    planId === p 
                      ? 'border-accent-orange bg-accent-orange/15 text-accent-orange' 
                      : 'border-border text-text-muted'
                  }`}
                  data-testid={`assign-plan-${p}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-1 block">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Paid via EFT"
              className="w-full bg-bg-primary border border-border rounded-lg py-3 px-4 text-text-primary text-sm"
              data-testid="assign-notes"
            />
          </div>
          <button
            onClick={handleAssign}
            disabled={loading}
            className="w-full bg-accent-orange text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            data-testid="confirm-assign-btn"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Assign Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SLA({ onBack }) {
  const { getAuthHeader, user, isAdmin, isStoreStaff } = useAuth();
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [polling, setPolling] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [plansRes, subsRes] = await Promise.all([
        axios.get(`${API}/sla/plans`),
        axios.get(`${API}/sla/subscriptions`, { headers: getAuthHeader() })
      ]);
      setPlans(plansRes.data);
      setSubscriptions(subsRes.data);
    } catch (err) {
      console.error('Failed to fetch SLA data');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check for returning from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      pollPaymentStatus(sessionId);
      window.history.replaceState({}, '', window.location.pathname);
    }
    // eslint-disable-next-line
  }, []);

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    if (attempts >= 5) { setPolling(false); return; }
    setPolling(true);
    try {
      const res = await axios.get(`${API}/sla/checkout/status/${sessionId}`, {
        headers: getAuthHeader()
      });
      if (res.data.payment_status === 'paid') {
        setPolling(false);
        fetchData();
        return;
      }
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), 2000);
    } catch {
      setPolling(false);
    }
  };

  const handleSubscribe = async (planId) => {
    setSubscribing(true);
    try {
      const storeName = user?.store_name || 'Unknown Store';
      const res = await axios.post(`${API}/sla/subscribe`, {
        store_name: storeName,
        plan_id: planId,
        origin_url: window.location.origin
      }, { headers: getAuthHeader() });
      
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to start checkout');
    } finally {
      setSubscribing(false);
    }
  };

  const handleStatusChange = async (subId, newStatus) => {
    try {
      await axios.put(`${API}/sla/subscriptions/${subId}?status=${newStatus}`, {}, {
        headers: getAuthHeader()
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update');
    }
  };

  const activeSub = subscriptions.find(s => s.status === 'active');

  return (
    <div className="page-content" data-testid="sla-page">
      {showAssign && (
        <AdminAssignModal
          onClose={() => setShowAssign(false)}
          onAssigned={fetchData}
        />
      )}

      <div className="px-4 pt-2 mb-2">
        <button onClick={onBack} className="flex items-center gap-1 text-text-secondary text-sm" data-testid="sla-back">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="page-header">
        <div className="page-header-title">SLA Subscriptions</div>
        <div className="page-header-sub">Monthly service level agreements for stores</div>
      </div>

      {polling && (
        <div className="mx-4 mb-4 bg-accent-orange/10 border border-accent-orange/30 rounded-lg p-4 flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-accent-orange" />
          <span className="text-sm text-accent-orange font-medium">Processing payment...</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-accent-orange" />
        </div>
      ) : (
        <>
          {/* Plans */}
          <div className="px-4 mb-6">
            <div className="text-xs font-semibold tracking-[2px] text-text-muted uppercase mb-3">Available Plans</div>
            <div className="space-y-3">
              {plans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSubscribe={handleSubscribe}
                  loading={subscribing}
                  currentPlan={activeSub?.plan_id}
                />
              ))}
            </div>
          </div>

          {/* Admin: Assign + Manage */}
          {isAdmin && (
            <div className="px-4 mb-6">
              <button
                onClick={() => setShowAssign(true)}
                className="w-full bg-accent-orange text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 mb-4"
                data-testid="assign-sla-btn"
              >
                <Users size={18} /> Assign SLA to Store
              </button>

              {subscriptions.length > 0 && (
                <>
                  <div className="text-xs font-semibold tracking-[2px] text-text-muted uppercase mb-3">
                    All Subscriptions ({subscriptions.length})
                  </div>
                  {subscriptions.map(sub => {
                    const planStyle = PLAN_STYLES[sub.plan_id] || PLAN_STYLES.silver;
                    const PlanIcon = planStyle.icon;
                    return (
                      <div key={sub.id} className="bg-bg-card rounded-lg p-4 mb-2" data-testid={`sub-${sub.id}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-sm font-semibold text-text-primary">{sub.store_name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${planStyle.badge}`}>
                                <PlanIcon size={10} className="inline mr-1" />{sub.plan_name}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLES[sub.status]}`}>
                                {sub.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-text-primary">R{sub.price.toLocaleString()}</div>
                            <div className="text-[10px] text-text-muted flex items-center gap-1">
                              <CreditCard size={10} /> {sub.payment_method}
                            </div>
                          </div>
                        </div>
                        {sub.current_period_end && (
                          <div className="text-[11px] text-text-muted flex items-center gap-1 mb-2">
                            <Calendar size={11} /> Expires: {new Date(sub.current_period_end).toLocaleDateString('en-GB')}
                          </div>
                        )}
                        {sub.notes && (
                          <div className="text-xs text-text-muted italic mb-2">{sub.notes}</div>
                        )}
                        {sub.status === 'active' && (
                          <button
                            onClick={() => handleStatusChange(sub.id, 'cancelled')}
                            className="text-xs text-red-400 hover:underline"
                            data-testid={`cancel-sub-${sub.id}`}
                          >
                            Cancel Subscription
                          </button>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* Store Staff: Show current subscription */}
          {!isAdmin && activeSub && (
            <div className="px-4 mb-6">
              <div className="text-xs font-semibold tracking-[2px] text-text-muted uppercase mb-3">Your Subscription</div>
              <div className="bg-bg-card rounded-lg p-4 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={18} className="text-green-400" />
                  <span className="text-sm font-semibold text-green-400">{activeSub.plan_name} Plan Active</span>
                </div>
                <div className="text-sm text-text-primary">R{activeSub.price.toLocaleString()}/month</div>
                {activeSub.current_period_end && (
                  <div className="text-xs text-text-muted mt-1">
                    Renews: {new Date(activeSub.current_period_end).toLocaleDateString('en-GB')}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
