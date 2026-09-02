/**
 * Role Switcher Layout Component
 * 
 * Persistent UI element for switching between user roles.
 * 
 * Validates Requirements: 1.1, 1.2, 1.3, 1.4, 2.5
 */

import React from 'react';
import { useRole, type Role } from '../../contexts/RoleContext';

export function RoleSwitcher() {
  const { role, switchRole } = useRole();

  const roles: { value: Role; label: string }[] = [
    { value: 'customer', label: 'Customer' },
    { value: 'worker', label: 'Worker' },
    { value: 'cooperative', label: 'Cooperative' }
  ];

  return (
    <div className="fixed top-6 right-6 z-sticky">
      <div className="bg-background-surface rounded-full shadow-md p-1 flex gap-1">
        {roles.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => switchRole(value)}
            className={`
              px-4 py-2 rounded-full text-sm font-mono font-medium
              transition-all duration-base
              ${
                role === value
                  ? 'bg-accent-primary text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-status-subtle'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
