import { useState } from 'react';
import '@/App.css';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import Callouts from '@/pages/Callouts';
import Equipment from '@/pages/Equipment';
import SelfHelp from '@/pages/SelfHelp';
import History from '@/pages/History';
import Users from '@/pages/Users';
import LoginHistory from '@/pages/LoginHistory';
import ResetCodes from '@/pages/ResetCodes';
import { APP_CONFIG } from '@/data';
import { LayoutDashboard, Wrench, Coffee, Lightbulb, ClipboardList, UsersIcon, Menu, LogOut, Clock, KeyRound } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'callouts', label: 'Callouts', icon: Wrench },
  { id: 'equipment', label: 'Equipment', icon: Coffee },
  { id: 'selfhelp', label: 'Self-Help', icon: Lightbulb },
  { id: 'history', label: 'History', icon: ClipboardList },
  { id: 'users', label: 'Users', icon: UsersIcon },
];

function BootleggerLogo() {
  return (
    <svg viewBox="0 0 320 58" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
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

function Header({ user, onLogout, onShowMenu, showMenu, onNavigate }) {
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';
  
  return (
    <header className="header" data-testid="app-header">
      <div className="header-logo">
        <div className="flex flex-col gap-0">
          <BootleggerLogo />
          <span className="text-[9px] font-semibold tracking-[3px] text-brand-gold uppercase mt-0.5 pl-0.5">ASSET TRACKER</span>
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
          <div className="absolute top-full right-0 mt-2 w-56 bg-bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden" data-testid="user-menu">
            <div className="p-3 border-b border-border">
              <div className="font-semibold text-sm text-text-primary">{user?.name}</div>
              <div className="text-xs text-text-muted truncate">{user?.email}</div>
            </div>
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
  const { user, logout, loading } = useAuth();
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
      case 'callouts': return <Callouts />;
      case 'equipment': return <Equipment />;
      case 'selfhelp': return <SelfHelp />;
      case 'history': return <History />;
      case 'users': return <Users />;
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
      {(page !== 'loginHistory' && page !== 'resetCodes') && <BottomNav active={page} onNav={setPage} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
