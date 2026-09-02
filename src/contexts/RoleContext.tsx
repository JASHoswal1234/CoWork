/**
 * Role Context Provider
 * 
 * Manages role switching between Customer, Worker, and Cooperative experiences.
 * Persists role selection in session storage.
 * 
 * Validates Requirements: 1.2, 1.3, 1.4, 18.5
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Role = 'customer' | 'worker' | 'cooperative';

interface RoleContextType {
  role: Role;
  switchRole: (newRole: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = 'sahakar-current-role';

interface RoleProviderProps {
  children: ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const [role, setRole] = useState<Role>(() => {
    // Load role from session storage or default to customer
    const stored = sessionStorage.getItem(ROLE_STORAGE_KEY);
    return (stored as Role) || 'customer';
  });

  const switchRole = (newRole: Role) => {
    setRole(newRole);
    sessionStorage.setItem(ROLE_STORAGE_KEY, newRole);
  };

  useEffect(() => {
    // Persist role changes to session storage
    sessionStorage.setItem(ROLE_STORAGE_KEY, role);
  }, [role]);

  return (
    <RoleContext.Provider value={{ role, switchRole }}>
      {children}
    </RoleContext.Provider>
  );
}

/**
 * Hook to access role context
 */
export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
