import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useRole, type Role } from '../../contexts/RoleContext';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Briefcase, Shield, Menu, X, ArrowRight, Sparkles } from 'lucide-react';

import { NotificationBell } from '../notifications/NotificationBell';

export function Header() {
  const { role, switchRole } = useRole();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSwitching, setIsSwitching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      logout();
    }
    setMobileMenuOpen(false);
    navigate('/');
    window.dispatchEvent(new CustomEvent('shram-sangam-go-home'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleChange = (targetRole: Role) => {
    if (targetRole === role || isSwitching) return;
    setIsSwitching(true);
    switchRole(targetRole);
    navigate('/');
    setIsSwitching(false);
    setMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-status-subtle bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-2 sm:px-4 md:px-6 lg:px-8 py-3">
        {/* Brand & Tagline */}
        <div className="flex items-center">
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-primary transition hover:opacity-90 cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-primary text-white shadow-sm">
              <Sparkles size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-extrabold tracking-[-0.04em] text-text-navy leading-none">
                SHRAM SANGAM
              </span>
              <span className="hidden sm:block font-mono text-[9px] font-semibold tracking-[0.12em] text-accent-primary uppercase mt-0.5">
                Work together. Grow together.
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6">
          <Link
            to="/"
            className={`text-xs font-semibold tracking-wide transition ${
              location.pathname === '/' ? 'text-accent-primary font-bold' : 'text-text-secondary hover:text-text-navy'
            }`}
          >
            Home
          </Link>

          {isAuthenticated ? (
            <>
              {role === 'customer' && (
                <Link
                  to="/"
                  className="text-xs font-semibold text-text-secondary hover:text-text-navy transition"
                >
                  Services
                </Link>
              )}

              {role === 'worker' && (
                <>
                  <Link
                    to="/passport"
                    className={`text-xs font-semibold transition ${
                      location.pathname === '/passport' ? 'text-accent-primary font-bold' : 'text-text-secondary hover:text-text-navy'
                    }`}
                  >
                    Skill Passport
                  </Link>
                </>
              )}

              {role === 'cooperative' && (
                <>
                  <Link
                    to="/intelligence/demand"
                    className={`text-xs font-semibold transition ${
                      location.pathname === '/intelligence/demand' ? 'text-accent-primary font-bold' : 'text-text-secondary hover:text-text-navy'
                    }`}
                  >
                    Demand Intelligence
                  </Link>
                  <Link
                    to="/intelligence/skills"
                    className={`text-xs font-semibold transition ${
                      location.pathname === '/intelligence/skills' ? 'text-accent-primary font-bold' : 'text-text-secondary hover:text-text-navy'
                    }`}
                  >
                    Skill Intelligence
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              <a
                href="#services"
                onClick={() => {
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="text-xs font-semibold text-text-secondary hover:text-text-navy transition"
              >
                Services
              </a>
              <a
                href="mailto:support@shramsangam.org"
                className="text-xs font-semibold text-text-secondary hover:text-text-navy transition"
              >
                Contact
              </a>
            </>
          )}
        </nav>

        {/* Desktop Right Controls (Auth & Roles) */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <NotificationBell />

              {/* User badge */}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-semibold text-text-navy">{user?.name || user?.email?.split('@')[0]}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-accent-primary">{user?.role || 'user'}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full border border-status-subtle bg-white px-3 py-1.5 font-mono text-[10px] font-semibold text-text-secondary transition hover:border-accent-primary/40 hover:text-text-navy"
                title="Sign out"
              >
                <LogOut size={13} />
                <span className="hidden lg:inline">LOGOUT</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 rounded-full border border-status-subtle bg-white px-3.5 py-1.5 font-mono text-[11px] font-semibold text-text-navy transition hover:border-accent-primary hover:text-accent-primary"
              >
                <span>Portal Login</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 rounded-full bg-accent-primary px-3.5 py-1.5 font-mono text-[11px] font-bold text-white shadow-sm transition hover:bg-accent-hover"
              >
                <span>Join Network</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile controls & menu button */}
        <div className="flex sm:hidden items-center gap-2">
          {isAuthenticated && <NotificationBell />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center rounded-xl p-2 text-text-navy hover:bg-background-primary transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-status-subtle bg-white px-4 py-4 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-2">
            <Link
              to="/"
              onClick={handleNavClick}
              className="py-2 text-sm font-semibold text-text-navy hover:text-accent-primary"
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                {role === 'customer' && (
                  <Link
                    to="/"
                    onClick={handleNavClick}
                    className="py-2 text-sm font-semibold text-text-navy hover:text-accent-primary"
                  >
                    Services
                  </Link>
                )}
                {role === 'worker' && (
                  <Link
                    to="/passport"
                    onClick={handleNavClick}
                    className="py-2 text-sm font-semibold text-text-navy hover:text-accent-primary"
                  >
                    Skill Passport
                  </Link>
                )}
                {role === 'cooperative' && (
                  <>
                    <Link
                      to="/intelligence/demand"
                      onClick={handleNavClick}
                      className="py-2 text-sm font-semibold text-text-navy hover:text-accent-primary"
                    >
                      Demand Intelligence
                    </Link>
                    <Link
                      to="/intelligence/skills"
                      onClick={handleNavClick}
                      className="py-2 text-sm font-semibold text-text-navy hover:text-accent-primary"
                    >
                      Skill Intelligence
                    </Link>
                  </>
                )}
              </>
            ) : (
              <a
                href="mailto:support@shramsangam.org"
                onClick={handleNavClick}
                className="py-2 text-sm font-semibold text-text-navy hover:text-accent-primary"
              >
                Contact
              </a>
            )}
          </nav>

          {/* Mobile Auth and Role controls */}
          <div className="border-t border-status-subtle pt-3">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-text-navy">{user?.name || user?.email?.split('@')[0]}</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-accent-primary">{user?.role || 'user'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 rounded-xl border border-status-subtle px-3 py-1.5 font-mono text-xs font-semibold text-text-secondary"
                  >
                    <LogOut size={13} />
                    <span>LOGOUT</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate('/')}
                  className="rounded-xl border border-status-subtle py-2.5 text-center font-mono text-xs font-semibold text-text-navy"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="rounded-xl bg-accent-primary py-2.5 text-center font-mono text-xs font-bold text-white shadow-sm"
                >
                  Join Network
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
