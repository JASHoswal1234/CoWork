import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole, type Role } from '../../contexts/RoleContext';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Briefcase, Shield } from 'lucide-react';

export function RoleSwitcher() {
  const { role, switchRole } = useRole();
  const { user, logout, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRoleChange = async (targetRole: Role) => {
    if (targetRole === role || isSwitching) return;
    setIsSwitching(true);
    try {
      await demoLogin(targetRole);
      switchRole(targetRole);
      navigate('/');
    } catch (e) {
      console.warn('Role switch error:', e);
      switchRole(targetRole);
      navigate('/');
    } finally {
      setIsSwitching(false);
    }
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

        {/* Center: Role Switcher Tabs */}
        <div className="flex items-center rounded-full border border-status-subtle bg-white/90 p-1 shadow-sm">
          <button
            onClick={() => handleRoleChange('customer')}
            disabled={isSwitching}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase transition ${
              role === 'customer'
                ? 'bg-accent-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-navy'
            }`}
          >
            <User size={12} />
            <span>Customer</span>
          </button>
          <button
            onClick={() => handleRoleChange('worker')}
            disabled={isSwitching}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase transition ${
              role === 'worker'
                ? 'bg-accent-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-navy'
            }`}
          >
            <Briefcase size={12} />
            <span>Worker</span>
          </button>
          <button
            onClick={() => handleRoleChange('cooperative')}
            disabled={isSwitching}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase transition ${
              role === 'cooperative'
                ? 'bg-text-navy text-white shadow-sm'
                : 'text-text-secondary hover:text-text-navy'
            }`}
          >
            <Shield size={12} />
            <span>Admin</span>
          </button>
        </div>

        {/* Right side: user info + logout */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-xs font-semibold text-text-navy">{user?.name || user?.email?.split('@')[0]}</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-accent-primary">{role}</span>
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

