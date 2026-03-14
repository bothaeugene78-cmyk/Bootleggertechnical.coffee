import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

const ALLOWED_DOMAINS = [
  '@bootlegger.co.za',
  '@bootlegger.com',
  '@bootlegger.coffee',
  '@rockandroller.coffee',
  '@rockandroller.co.za',
  '@rockandroller.com'
];

function BootleggerLogo() {
  return (
    <svg viewBox="0 0 320 58" className="h-10 w-auto" xmlns="http://www.w3.org/2000/svg">
      <text
        x="0" y="36"
        fontFamily="'Playfair Display', Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="33"
        letterSpacing="2"
        fill="white"
      >BOOTLEGGER</text>
      <circle cx="308" cy="24" r="5" fill="#c9a84c"/>
      <rect x="0" y="48" width="265" height="2.5" rx="1.25" fill="#c9a84c"/>
    </svg>
  );
}

export default function LoginPage() {
  const { login, register, error } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!formData.name) {
        setFormError('Please enter your name');
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setFormError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (!result.success) {
          setFormError(result.error);
        }
      } else {
        const result = await register(formData.name, formData.email, formData.password);
        if (!result.success) {
          setFormError(result.error);
        }
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4" data-testid="login-page">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <BootleggerLogo />
          </div>
          <span className="text-[10px] font-semibold tracking-[3px] text-brand-gold uppercase">ASSET TRACKER</span>
        </div>

        {/* Form Card */}
        <div className="bg-bg-card rounded-2xl p-6 border border-border">
          <h2 className="font-display text-2xl font-bold text-center mb-6">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          {/* Error Message */}
          {(formError || error) && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex items-start gap-2" data-testid="auth-error">
              <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-400">{formError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (Register only) */}
            {!isLogin && (
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-1 block">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full bg-bg-primary border border-border rounded-lg py-3 pl-10 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-orange"
                    data-testid="register-name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-1 block">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@bootlegger.co.za"
                  className="w-full bg-bg-primary border border-border rounded-lg py-3 pl-10 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-orange"
                  data-testid="auth-email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-1 block">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-bg-primary border border-border rounded-lg py-3 pl-10 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-orange"
                  data-testid="auth-password"
                />
              </div>
            </div>

            {/* Confirm Password (Register only) */}
            {!isLogin && (
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider mb-1 block">Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-bg-primary border border-border rounded-lg py-3 pl-10 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-orange"
                    data-testid="register-confirm-password"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-orange text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              data-testid="auth-submit"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setFormError('');
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
              }}
              className="text-sm text-text-secondary hover:text-accent-orange transition-colors"
              data-testid="auth-toggle"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-accent-orange font-semibold">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </span>
            </button>
          </div>
        </div>

        {/* Allowed Domains Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-muted mb-2">Authorized email domains:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {ALLOWED_DOMAINS.map(domain => (
              <span key={domain} className="text-xs bg-bg-card px-2 py-1 rounded text-text-secondary">
                {domain}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
