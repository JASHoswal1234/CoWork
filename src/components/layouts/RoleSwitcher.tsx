/**
 * Role Switcher Layout Component
 * 
 * Persistent UI element for switching between user roles.
 * 
 * Validates Requirements: 1.1, 1.2, 1.3, 1.4, 2.5
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole, type Role } from '../../contexts/RoleContext';

export function RoleSwitcher() {
  const { role, switchRole } = useRole();
  const navigate = useNavigate();

  const roles: { value: Role; label: string }[] = [
    { value: 'customer', label: 'Customer' },
    { value: 'worker', label: 'Worker' },
    { value: 'cooperative', label: 'Cooperative' }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-status-subtle/90 bg-background-primary/90 px-4 py-3 backdrop-blur sm:px-5 sm:py-4 md:px-10">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 sm:gap-4">
        {/* Brand - Compact on mobile */}
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
        
        {/* Role Switcher - Compact segmented control */}
        <nav aria-label="Demo role switcher" className="flex shrink-0 rounded-full border border-status-subtle bg-white p-0.5 sm:p-1">
          {roles.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { switchRole(value); navigate('/'); }}
              className={`
                whitespace-nowrap rounded-full px-2 py-1.5 text-[9px] font-mono font-semibold tracking-[0.04em] transition-all duration-200
                sm:px-3 sm:py-2 sm:text-[10px] md:px-4 md:text-xs
                ${
                  role === value
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-navy hover:bg-status-subtle/50'
                }
              `}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
