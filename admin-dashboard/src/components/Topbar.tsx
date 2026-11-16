import React from 'react';
import { Bell, Search, Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  subtitle,
  onRefresh,
  isRefreshing = false
}) => {
  const { adminProfile, isDemoMode } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Environment Badge */}
        <a
          href="https://console.firebase.google.com/project/messup-ee9fc/firestore"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          title="Open Cloud Firestore Console for messup-ee9fc"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Firebase Live Backend</span>
        </a>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Refresh Backend Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        )}

        {/* Admin profile pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {adminProfile?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{adminProfile?.name || 'Admin User'}</p>
            <p className="text-[10px] text-emerald-700 font-medium">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};
