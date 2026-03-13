import { useState } from 'react';
import { SELF_HELP_GUIDES } from '@/data';
import { ArrowLeft, Brush, Droplet, Settings, Zap, Thermometer, Clipboard, Droplets, ChevronRight } from 'lucide-react';

const iconMap = {
  brush: Brush,
  droplet: Droplet,
  settings: Settings,
  zap: Zap,
  thermometer: Thermometer,
  clipboard: Clipboard,
  droplets: Droplets,
};

export default function SelfHelp() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const categories = ['all', ...new Set(SELF_HELP_GUIDES.map(g => g.category))];
  const filtered = filter === 'all' ? SELF_HELP_GUIDES : SELF_HELP_GUIDES.filter(g => g.category === filter);

  const catColor = (c) => {
    if (c === 'Cleaning') return { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' };
    if (c === 'Maintenance') return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' };
    if (c === 'Inspection') return { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' };
    return { bg: 'rgba(16,185,129,0.15)', color: '#10b981' };
  };

  if (selected) {
    const guide = SELF_HELP_GUIDES.find(g => g.id === selected);
    const color = catColor(guide.category);
    const Icon = iconMap[guide.icon] || Clipboard;
    return (
      <div className="page-content" data-testid="guide-detail">
        <div className="p-3 flex items-center gap-2.5">
          <button 
            onClick={() => setSelected(null)} 
            className="bg-bg-card border-none rounded-lg px-3 py-2 text-text-secondary cursor-pointer text-[13px] flex items-center gap-1"
            data-testid="back-btn"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div className="px-4 pb-5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: color.bg }}>
            <Icon size={24} style={{ color: color.color }} />
          </div>
          <div 
            className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase mb-2.5"
            style={{ background: color.bg, color: color.color }}
          >
            {guide.category}
          </div>
          <div className="font-display text-2xl font-bold mb-2">{guide.title}</div>
          <div className="text-[13px] text-text-muted leading-relaxed mb-6">{guide.desc}</div>

          <div className="font-display text-base font-semibold tracking-wider uppercase mb-3.5">Steps</div>

          {guide.steps.map((step, i) => (
            <div key={i} className="flex gap-3.5 mb-3.5">
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
                style={{ background: color.bg, color: color.color }}
              >
                {i + 1}
              </div>
              <div className="text-sm text-text-secondary leading-relaxed pt-1">{step}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-content" data-testid="selfhelp-page">
      <div className="page-header">
        <div className="page-header-title">Self-Help</div>
        <div className="page-header-sub">{SELF_HELP_GUIDES.length} guides available</div>
      </div>

      <div className="filter-tabs" data-testid="category-filters">
        {categories.map(c => (
          <button key={c} className={`filter-tab ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
            {c === 'all' ? 'All Guides' : c}
          </button>
        ))}
      </div>

      {filtered.map(guide => {
        const color = catColor(guide.category);
        const Icon = iconMap[guide.icon] || Clipboard;
        return (
          <div 
            key={guide.id} 
            className="help-card" 
            onClick={() => setSelected(guide.id)}
            data-testid={`guide-${guide.id}`}
          >
            <div className="help-icon" style={{ background: color.bg }}>
              <Icon size={20} style={{ color: color.color }} />
            </div>
            <div className="help-content">
              <div className="flex items-center gap-2 mb-1">
                <div className="help-title">{guide.title}</div>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span 
                  className="text-[10px] px-1.5 py-0.5 rounded-lg font-semibold tracking-wide"
                  style={{ background: color.bg, color: color.color }}
                >
                  {guide.category}
                </span>
                <span className="text-[11px] text-text-muted">{guide.steps.length} steps</span>
              </div>
              <div className="help-desc">{guide.desc}</div>
            </div>
            <ChevronRight size={16} className="text-text-muted" />
          </div>
        );
      })}
    </div>
  );
}
