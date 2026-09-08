import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export function RoleSwitcher() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-status-subtle/90 bg-background-primary/90 px-4 py-2.5 backdrop-blur sm:px-5 sm:py-3 md:px-10">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <button
          onClick={() => navigate('/')}
          className="min-w-0 flex-shrink text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-primary"
        >
          <span className="block truncate text-xs font-extrabold tracking-[-0.04em] text-text-navy sm:text-sm md:text-base">
            SHRAMSANGAM
          </span>
          <span className="hidden font-mono text-[8px] font-medium tracking-[0.12em] text-text-secondary md:block">
            LOCAL SKILLS. SHARED OPPORTUNITY.
          </span>
        </button>



        {/* Right side: user info + logout */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-xs font-semibold text-text-navy">{user?.name || user?.email?.split('@')[0]}</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-accent-primary">{user?.role || 'user'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full border border-status-subtle bg-white px-3 py-1.5 font-mono text-[10px] font-semibold text-text-secondary transition hover:border-accent-primary/30 hover:text-text-navy"
          >
            <LogOut size={13} />
            <span className="hidden sm:block">LOGOUT</span>
          </button>
        </div>
      </div>
    </header>
  );
}

