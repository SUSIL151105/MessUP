import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ChefHat, 
  Building, 
  UtensilsCrossed, 
  Star, 
  MessageSquareWarning, 
  Megaphone, 
  ScrollText, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 
  | 'dashboard'
  | 'students'
  | 'incharges'
  | 'hierarchy'
  | 'menus'
  | 'ratings'
  | 'complaints'
  | 'announcements'
  | 'audit'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed
}) => {
  const { logout, adminProfile } = useAuth();

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'students' as ActiveTab, label: 'Student Directory', icon: Users },
    { id: 'incharges' as ActiveTab, label: 'Food Incharges', icon: ChefHat },
    { id: 'hierarchy' as ActiveTab, label: 'Institutions & Messes', icon: Building },
    { id: 'menus' as ActiveTab, label: 'Menu Schedule', icon: UtensilsCrossed },
    { id: 'ratings' as ActiveTab, label: 'Meal Ratings & Quality', icon: Star },
    { id: 'complaints' as ActiveTab, label: 'Complaints & Feedback', icon: MessageSquareWarning },
    { id: 'announcements' as ActiveTab, label: 'Announcements', icon: Megaphone },
    { id: 'audit' as ActiveTab, label: 'Security & Audit Logs', icon: ScrollText },
    { id: 'settings' as ActiveTab, label: 'System Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 select-none z-20 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <img 
            src="/logo.png" 
            alt="MessUP Logo" 
            className="w-10 h-10 rounded-xl object-contain bg-white/95 p-0.5 shadow-md shadow-emerald-500/20 flex-shrink-0" 
          />
          {!collapsed && (
            <div className="truncate">
              <span className="font-bold text-white tracking-tight text-lg block leading-tight">MessUP</span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase block">Every Meal Matters</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Connected Android App status indicator */}
      {!collapsed && (
        <div className="mx-3 my-2 p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-medium mb-1">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Shared Android Cloud</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Live sync with Students & Food Incharge mobile apps on <code className="text-emerald-300">messup-ee9fc</code>
          </p>
        </div>
      )}

      {/* Admin User info & logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/50">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{adminProfile?.name || 'Administrator'}</p>
              <p className="text-[11px] text-slate-400 truncate">{adminProfile?.email || 'admin@messup.edu'}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
