import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate, useLocation, Navigate } from 'react-router';
import { useAuth, getRoleLabel } from '../context/AuthContext';
import {
  LayoutDashboard, Map, Calculator, ListChecks, BarChart3, Users, Database,
  Settings, LogOut, Bell, Menu, X, Sprout, ChevronDown, Leaf, Microscope,
  BookOpen, TrendingUp, CloudSun, MessageSquare, UserCheck, ShieldCheck,
  FileText, AlertTriangle, Star
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

function getNavItems(role: string, notifications: number = 0): NavItem[] {
  if (role === 'farmer') {
    return [
      { label: 'Dashboard',              path: '/farmer/dashboard',         icon: LayoutDashboard },
      { label: 'Τα Χωράφια μου',         path: '/farmer/fields',            icon: Map },
      { label: 'Οικονομικά',             path: '/farmer/financials',        icon: TrendingUp },
      { label: 'Εργασίες',               path: '/farmer/tasks',             icon: ListChecks, badge: 4 },
      { label: 'Συστάσεις',              path: '/farmer/recommendations',   icon: MessageSquare, badge: notifications },
      { label: 'Καιρός',                 path: '/farmer/weather',           icon: CloudSun },
      { label: 'Αναφορές',               path: '/farmer/reports',           icon: FileText },
    ];
  }
  if (role === 'agronomist') {
    return [
      { label: 'Dashboard',              path: '/agronomist/dashboard',        icon: LayoutDashboard },
      { label: 'Αγρότες',               path: '/agronomist/farmers',          icon: Users },
      { label: 'Χωράφια',               path: '/agronomist/fields',           icon: Map },
      { label: 'Συστάσεις',              path: '/agronomist/recommendations',  icon: MessageSquare, badge: 2 },
      { label: 'Βιβλιοθήκη Καλλιεργειών', path: '/agronomist/crop-library',   icon: BookOpen },
      { label: 'Αναλύσεις',             path: '/agronomist/analytics',        icon: BarChart3 },
      { label: 'Αναφορές',               path: '/agronomist/reports',          icon: FileText },
    ];
  }
  if (role === 'admin') {
    return [
      { label: 'Dashboard',              path: '/admin/dashboard',     icon: LayoutDashboard },
      { label: 'Χρήστες',               path: '/admin/users',         icon: Users },
      { label: 'Βάση Καλλιεργειών',     path: '/admin/crops',         icon: Database },
      { label: 'Αναλύσεις',             path: '/admin/analytics',     icon: BarChart3 },
      { label: 'Ειδοποιήσεις',          path: '/admin/notifications', icon: Bell, badge: 3 },
      { label: 'Ρυθμίσεις',             path: '/admin/settings',      icon: Settings },
    ];
  }
  return [];
}

function getRoleTheme(role: string) {
  if (role === 'farmer')     return { bg: '#1b4332', accent: '#40916c', light: '#d1fae5' };
  if (role === 'agronomist') return { bg: '#0c4a6e', accent: '#0284c7', light: '#dbeafe' };
  if (role === 'admin')      return { bg: '#3b0764', accent: '#7c3aed', light: '#ede9fe' };
  return { bg: '#1b4332', accent: '#40916c', light: '#d1fae5' };
}

function getRoleIcon(role: string) {
  if (role === 'farmer')     return '👨‍🌾';
  if (role === 'agronomist') return '🔬';
  if (role === 'admin')      return '⚙️';
  return '👤';
}

interface LayoutProps { children: ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (!currentUser) return <Navigate to="/" replace />;

  const theme    = getRoleTheme(currentUser.role);
  const navItems = getNavItems(currentUser.role, 2);

  const handleLogout = () => { logout(); navigate('/'); };

  const getPageTitle = () => {
    const current = navItems.find(item => location.pathname.startsWith(item.path));
    return current?.label ?? 'Agrotical';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <div className="text-white text-base" style={{ fontWeight: 700 }}>Agrotical</div>
              <div className="text-white/50 text-xs">{getRoleLabel(currentUser.role)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                isActive ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              style={isActive ? { backgroundColor: theme.accent } : {}}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="text-sm flex-1" style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full text-xs text-white" style={{ background: '#ef4444', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                      {item.badge}
                    </span>
                  ) : null}
                </>
              )}
              {!sidebarOpen && item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs text-white flex items-center justify-center"
                  style={{ background: '#ef4444', fontSize: '10px', fontWeight: 700 }}>
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-white/10">
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/10 ${sidebarOpen ? '' : 'justify-center'}`}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0 bg-white/20">
            {getRoleIcon(currentUser.role)}
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm truncate" style={{ fontWeight: 600 }}>{currentUser.name}</div>
              <div className="text-white/50 text-xs truncate">{currentUser.email}</div>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all w-full ${sidebarOpen ? '' : 'justify-center'}`}
        >
          <LogOut className="w-4 h-4" />
          {sidebarOpen && <span className="text-sm">Αποσύνδεση</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col flex-shrink-0 transition-all duration-300" style={{ width: sidebarOpen ? '240px' : '72px' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => { setSidebarOpen(!sidebarOpen); setMobileOpen(!mobileOpen); }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1">
            <h1 className="text-lg" style={{ fontWeight: 600, color: '#111827' }}>{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: theme.light }}>
                  {getRoleIcon(currentUser.role)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm" style={{ fontWeight: 600, color: '#111827' }}>{currentUser.name.split(' ')[0]}</div>
                  <div className="text-xs text-gray-500">{getRoleLabel(currentUser.role)}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-sm" style={{ fontWeight: 600 }}>{currentUser.name}</div>
                    <div className="text-xs text-gray-500">{currentUser.email}</div>
                    <div className="mt-1 inline-flex px-2 py-0.5 rounded-full text-xs" style={{ background: theme.light, color: theme.accent, fontWeight: 600 }}>
                      {getRoleLabel(currentUser.role)}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Αποσύνδεση
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
