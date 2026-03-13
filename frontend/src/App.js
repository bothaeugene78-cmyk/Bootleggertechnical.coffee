import { useState } from 'react';
import '@/App.css';
import Dashboard from '@/pages/Dashboard';
import Callouts from '@/pages/Callouts';
import Equipment from '@/pages/Equipment';
import SelfHelp from '@/pages/SelfHelp';
import History from '@/pages/History';
import Users from '@/pages/Users';
import { APP_CONFIG } from '@/data';
import { LayoutDashboard, Wrench, Coffee, Lightbulb, ClipboardList, UsersIcon, Menu } from 'lucide-react';

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

function Header({ userInitial }) {
  return (
    <header className="header" data-testid="app-header">
      <div className="header-logo">
        <div className="flex flex-col gap-0">
          <BootleggerLogo />
          <span className="text-[9px] font-semibold tracking-[3px] text-brand-gold uppercase mt-0.5 pl-0.5">ASSET TRACKER</span>
        </div>
      </div>
      <div className="header-actions">
        <div className="avatar-btn" data-testid="user-avatar">{userInitial}</div>
        <button className="menu-btn" aria-label="Menu" data-testid="menu-btn">
          <Menu size={22} className="text-text-secondary" />
        </button>
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

export default function App() {
  const [page, setPage] = useState('dashboard');

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={setPage} />;
      case 'callouts': return <Callouts />;
      case 'equipment': return <Equipment />;
      case 'selfhelp': return <SelfHelp />;
      case 'history': return <History />;
      case 'users': return <Users />;
      default: return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <div className="app-container" data-testid="app-container">
      <Header userInitial={APP_CONFIG.userInitial} />
      {renderPage()}
      <BottomNav active={page} onNav={setPage} />
    </div>
  );
}
