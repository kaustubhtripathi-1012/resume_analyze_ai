import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  LayoutDashboard,
  UploadCloud,
  Briefcase,
  Sparkles,
  Users,
  Settings,
  LogOut,
  BarChart3,
  Tags,
  Menu,
  X,
  UserCheck
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';

export const DashboardLayout: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore logout errors
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  // Build nav items based on role
  const role = user?.role || 'candidate';

  let navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Upload Resume', path: '/upload', icon: UploadCloud },
    { label: 'Browse Jobs', path: '/jobs', icon: Briefcase },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  if (role === 'recruiter') {
    navItems = [
      { label: 'Recruiter Dashboard', path: '/recruiter', icon: LayoutDashboard },
      { label: 'Post a Job', path: '/recruiter/jobs/new', icon: Briefcase },
      { label: 'Browse Jobs', path: '/jobs', icon: Briefcase },
      { label: 'Settings', path: '/settings', icon: Settings },
    ];
  } else if (role === 'admin') {
    navItems = [
      { label: 'Overview Analytics', path: '/admin/analytics', icon: BarChart3 },
      { label: 'Users Management', path: '/admin/users', icon: Users },
      { label: 'Skills Taxonomy', path: '/admin/skills', icon: Tags },
      { label: 'All Jobs', path: '/jobs', icon: Briefcase },
      { label: 'Settings', path: '/settings', icon: Settings },
    ];
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-surface border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-lg">
          <FileText className="w-6 h-6" />
          <span>ResumeAI</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-muted hover:text-text rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-slate-200 flex flex-col transition-transform md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static`}>
        {/* Brand */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-xl shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-900">ResumeAI</h1>
            <span className="text-xs uppercase font-semibold text-primary tracking-wider">{role} Portal</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/jobs' && item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-primary'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-3">
            <div className="truncate">
              <p className="text-sm font-semibold text-text truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted truncate">{user?.email}</p>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-danger hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

