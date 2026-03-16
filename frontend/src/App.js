import { useState, useEffect } from 'react';
import '@/App.css';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import Tickets from '@/pages/Tickets';
import Equipment from '@/pages/Equipment';
import SelfHelp from '@/pages/SelfHelp';
import History from '@/pages/History';
import Users from '@/pages/Users';
import LoginHistory from '@/pages/LoginHistory';
import ResetCodes from '@/pages/ResetCodes';
import SLA from '@/pages/SLA';
import { APP_CONFIG } from '@/data';
import { LayoutDashboard, Ticket, Coffee, Lightbulb, ClipboardList, UsersIcon, Menu, LogOut, Clock, KeyRound, Download, X, Shield } from 'lucide-react';

// PWA Install Prompt
function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;
    if (localStorage.getItem('pwa_dismissed')) return;

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);
    if (ios) { setShowBanner(true); return; }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('pwa_dismissed', '1');
  };

  if (!showBanner || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[300] bg-gradient-to-r from-[#1a1d27] to-[#252830] border-b border-accent-orange/30 px-4 py-3 shadow-lg" data-testid="install-banner">
      <div className="max-w-[480px] mx-auto flex items-center gap-3">
        <img src="/icon-48.png" alt="Bootlegger" className="w-10 h-10 rounded-lg" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-text-primary">Install Bootlegger App</div>
          <div className="text-xs text-text-muted">
            {isIOS ? 'Tap Share then "Add to Home Screen"' : 'Quick access from your home screen'}
          </div>
        </div>
        {!isIOS && (
          <button
            onClick={handleInstall}
            className="bg-accent-orange text-black text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 flex-shrink-0"
            data-testid="install-btn"
          >
            <Download size={14} /> Install
          </button>
        )}
        <button onClick={handleDismiss} className="text-text-muted flex-shrink-0" data-testid="dismiss-install">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tickets', label: 'Tickets', icon: Ticket },
  { id: 'sla', label: 'SLA', icon: Shield },
  { id: 'equipment', label: 'Equipment', icon: Coffee },
  { id: 'history', label: 'History', icon: ClipboardList },
];

function BootleggerLogo() {
  return (
    <img 
      src="/bootlegger-logo.png" 
      alt="Bootlegger" 
      className="h-8 w-auto"
      data-testid="bootlegger-logo"
    />
  );
}

function RoleBadge({ role }) {
  const roleColors = {
    admin: 'bg-red-500/20 text-red-400',
    technician: 'bg-blue-500/20 text-blue-400',
    accounting: 'bg-green-500/20 text-green-400',
    store_staff: 'bg-orange-500/20 text-orange-400'
  };
  
  const roleLabels = {
    admin: 'Admin',
    technician: 'Technician',
    accounting: 'Accounting',
    store_staff: 'Store Staff'
  };

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${roleColors[role] || roleColors.store_staff}`}>
      {roleLabels[role] || 'Staff'}
    </span>
  );
}

function Header({ user, onLogout, onShowMenu, showMenu, onNavigate }) {
  const { isAdmin } = useAuth();
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';
  
  return (
    <header className="header" data-testid="app-header">
      <div className="header-logo">
        <div className="flex flex-col gap-0">
          <BootleggerLogo />
          <span className="text-[9px] font-semibold tracking-[3px] text-brand-gold uppercase mt-0.5 pl-0.5">SERVICE MANAGEMENT</span>
        </div>
      </div>
      <div className="header-actions relative">
        <div 
          className="avatar-btn cursor-pointer" 
          data-testid="user-avatar"
          onClick={onShowMenu}
          title={user?.name}
        >
          {userInitial}
        </div>
        <button className="menu-btn" aria-label="Menu" data-testid="menu-btn" onClick={onShowMenu}>
          <Menu size={22} className="text-text-secondary" />
        </button>
        
        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden" data-testid="user-menu">
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm text-text-primary">{user?.name}</div>
                <RoleBadge role={user?.role} />
              </div>
              <div className="text-xs text-text-muted truncate">{user?.email}</div>
              {user?.store_name && (
                <div className="text-xs text-accent-orange mt-1">{user.store_name}</div>
              )}
            </div>
            
            <button
              onClick={() => { onNavigate('users'); onShowMenu(); }}
              className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-bg-primary transition-colors text-left"
              data-testid="users-btn"
            >
              <UsersIcon size={18} className="text-text-muted" />
              <span className="text-sm text-text-secondary">Team Members</span>
            </button>
            
            {isAdmin && (
              <>
                <button
                  onClick={() => { onNavigate('loginHistory'); onShowMenu(); }}
                  className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-bg-primary transition-colors text-left"
                  data-testid="login-history-btn"
                >
                  <Clock size={18} className="text-accent-blue" />
                  <span className="text-sm text-text-secondary">Login History</span>
                </button>
                <button
                  onClick={() => { onNavigate('resetCodes'); onShowMenu(); }}
                  className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-bg-primary transition-colors text-left"
                  data-testid="reset-codes-btn"
                >
                  <KeyRound size={18} className="text-accent-orange" />
                  <span className="text-sm text-text-secondary">Password Resets</span>
                </button>
              </>
            )}
            
            <button
              onClick={onLogout}
              className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-bg-primary transition-colors text-left border-t border-border"
              data-testid="logout-btn"
            >
              <LogOut size={18} className="text-accent-red" />
              <span className="text-sm text-text-secondary">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function BottomNav({ active, onNav }) {
  return (
    <nav className="bottom-nav" data-testid="bottom-nav">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className={`nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onNav(item.id)}
            data-testid={`nav-${item.id}`}
          >
            <Icon size={20} className="nav-icon-svg" />
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function AuthenticatedApp() {
  const { user, logout, loading, isAdmin } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [showMenu, setShowMenu] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={setPage} />;
      case 'tickets': return <Tickets />;
      case 'sla': return <SLA onBack={() => setPage('dashboard')} />;
      case 'equipment': return <Equipment />;
      case 'selfhelp': return <SelfHelp />;
      case 'history': return <History />;
      case 'users': return <Users onBack={() => setPage('dashboard')} />;
      case 'loginHistory': return <LoginHistory onBack={() => setPage('dashboard')} />;
      case 'resetCodes': return <ResetCodes onBack={() => setPage('dashboard')} />;
      default: return <Dashboard onNavigate={setPage} />;
    }
  };

  // Close menu when clicking outside
  const handleContainerClick = (e) => {
    if (showMenu && !e.target.closest('[data-testid="user-menu"]') && !e.target.closest('[data-testid="menu-btn"]') && !e.target.closest('[data-testid="user-avatar"]')) {
      setShowMenu(false);
    }
  };

  const showBottomNav = !['loginHistory', 'resetCodes', 'users'].includes(page);

  return (
    <div className="app-container" data-testid="app-container" onClick={handleContainerClick}>
      <Header 
        user={user} 
        onLogout={logout}
        showMenu={showMenu}
        onShowMenu={() => setShowMenu(!showMenu)}
        onNavigate={setPage}
      />
      {renderPage()}
      {showBottomNav && <BottomNav active={page} onNav={setPage} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <InstallBanner />
      <AuthenticatedApp />
    </AuthProvider>
  );
}
