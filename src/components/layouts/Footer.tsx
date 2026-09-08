import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole, type Role } from '../../contexts/RoleContext';
import { Sparkles, Briefcase, User, ExternalLink } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserGroup02Icon } from '@hugeicons/core-free-icons';

export function Footer() {
  const { isAuthenticated, logout } = useAuth();
  const { role, switchRole } = useRole();
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      logout();
    }
    navigate('/');
    window.dispatchEvent(new CustomEvent('shram-sangam-go-home'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleQuickSwitch = (targetRole: Role) => {
    switchRole(targetRole);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-auto border-t border-status-subtle bg-white text-text-primary">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-12">
          {/* Column 1: Brand & Philosophy (5 cols) */}
          <div className="space-y-4 md:col-span-5">
            <Link
              to="/"
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 transition hover:opacity-90 cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden">
                <img src="/logo/logo.png" alt="ShramSangam Logo" className="h-full w-full object-contain" />
              </div>
              <span className="text-lg font-extrabold tracking-[-0.04em] text-text-navy">
                SHRAM SANGAM
              </span>
            </Link>
            
            <p className="font-mono text-xs font-semibold text-accent-primary uppercase tracking-wider">
              "Work together. Grow together."
            </p>

            <p className="max-w-sm text-xs leading-relaxed text-text-secondary">
              A worker-owned cooperative service platform connecting communities with skilled tradespeople. Dedicated to fair wages, verified skills, and transparent local opportunities.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-status-subtle bg-background-primary px-3 py-1 text-[11px] font-medium text-text-secondary">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cooperative Network Active across Maharashtra</span>
            </div>
          </div>

          {/* Column 2: Quick Links (3 cols) */}
          <div className="space-y-3 md:col-span-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-tertiary">
              QUICK NAVIGATION
            </p>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link
                  to="/"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-text-secondary transition hover:text-accent-primary focus-visible:outline-none focus-visible:underline"
                >
                  Home & Overview
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-text-secondary transition hover:text-accent-primary focus-visible:outline-none focus-visible:underline"
                >
                  Services Catalog
                </Link>
              </li>
              {isAuthenticated && role === 'worker' && (
                <li>
                  <Link
                    to="/passport"
                    className="text-text-secondary transition hover:text-accent-primary focus-visible:outline-none focus-visible:underline"
                  >
                    Skill Passport
                  </Link>
                </li>
              )}
              {isAuthenticated && role === 'cooperative' && (
                <>
                  <li>
                    <Link
                      to="/intelligence/demand"
                      className="text-text-secondary transition hover:text-accent-primary focus-visible:outline-none focus-visible:underline"
                    >
                      Demand Intelligence
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/intelligence/skills"
                      className="text-text-secondary transition hover:text-accent-primary focus-visible:outline-none focus-visible:underline"
                    >
                      Skill Intelligence
                    </Link>
                  </li>
                </>
              )}
              <li>
                <a
                  href="mailto:support@shramsangam.org"
                  className="text-text-secondary transition hover:text-accent-primary focus-visible:outline-none focus-visible:underline"
                >
                  Help & Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Portals & Access (4 cols) */}
          <div className="space-y-3 md:col-span-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-tertiary">
              PORTALS & ROLES
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:grid-cols-1">
              <button
                onClick={() => handleRoleQuickSwitch('customer')}
                className="flex items-center justify-between rounded-xl border border-status-subtle bg-[#F7F7F7] px-3.5 py-2.5 text-left text-xs font-semibold text-text-navy transition hover:border-accent-primary/40 hover:bg-white"
              >
                <div className="flex items-center gap-2">
                  <User size={14} className="text-accent-primary" />
                  <span>Customer Portal</span>
                </div>
                <span className="font-mono text-[9px] text-text-tertiary">BOOK</span>
              </button>

              <button
                onClick={() => handleRoleQuickSwitch('worker')}
                className="flex items-center justify-between rounded-xl border border-status-subtle bg-[#F7F7F7] px-3.5 py-2.5 text-left text-xs font-semibold text-text-navy transition hover:border-accent-primary/40 hover:bg-white"
              >
                <div className="flex items-center gap-2">
                  <Briefcase size={14} className="text-accent-primary" />
                  <span>Worker Portal</span>
                </div>
                <span className="font-mono text-[9px] text-text-tertiary">EARN</span>
              </button>

              <button
                onClick={() => handleRoleQuickSwitch('cooperative')}
                className="flex items-center justify-between rounded-xl border border-status-subtle bg-[#F7F7F7] px-3.5 py-2.5 text-left text-xs font-semibold text-text-navy transition hover:border-accent-primary/40 hover:bg-white"
              >
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={UserGroup02Icon} size={14} color="currentColor" strokeWidth={1.5} className="text-text-navy" />
                  <span>Cooperative Admin</span>
                </div>
                <span className="font-mono text-[9px] text-text-tertiary">MANAGE</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom divider and copyright bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-status-subtle pt-6 text-xs text-text-tertiary sm:flex-row">
          <p className="font-mono text-[11px]">
            © 2026 Shram Sangam. Built for workers. Powered by cooperation.
          </p>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>LOCAL SKILLS</span>
            <span>•</span>
            <span>SHARED OPPORTUNITY</span>
            <span>•</span>
            <span>FAIR WAGES</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
