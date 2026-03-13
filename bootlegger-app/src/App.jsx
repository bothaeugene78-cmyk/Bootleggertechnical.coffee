import { useState } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import Callouts from './pages/Callouts.jsx';
import Equipment from './pages/Equipment.jsx';
import SelfHelp from './pages/SelfHelp.jsx';
import History from './pages/History.jsx';
import Users from './pages/Users.jsx';
import { APP_CONFIG } from './data.js';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'callouts', label: 'Callouts', icon: '🔧' },
  { id: 'equipment', label: 'Equipment', icon: '☕' },
  { id: 'selfhelp', label: 'Self-Help', icon: '💡' },
  { id: 'history', label: 'History', icon: '📋' },
  { id: 'users', label: 'Users', icon: '👥' },
];

function BootleggerLogo() {
  return (
    <svg viewBox="0 0 320 58" style={{ height: 32, width: 'auto' }} xmlns="http://www.w3.org/2000/svg">
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
    <header className="header">
      <div className="header-logo" style={{ gap: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <BootleggerLogo />
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '3px', color: '#c9a84c', textTransform: 'uppercase', marginTop: 2, paddingLeft: 1 }}>ASSET TRACKER</span>
        </div>
      </div>
      <div className="header-actions">
        <div className="avatar-btn">{userInitial}</div>
        <button className="menu-btn" aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}

function BottomNav({ active, onNav }) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`nav-item ${active === item.id ? 'active' : ''}`}
          onClick={() => onNav(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
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
    <div className="app-container">
      <Header userInitial={APP_CONFIG.userInitial} />
      {renderPage()}
      <BottomNav active={page} onNav={setPage} />
    </div>
  );
}
