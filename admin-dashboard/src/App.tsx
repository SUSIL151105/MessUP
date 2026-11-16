import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar, type ActiveTab } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardOverview } from './components/DashboardOverview';
import { StudentManagement } from './components/StudentManagement';
import { InchargeManagement } from './components/InchargeManagement';
import { HierarchyManagement } from './components/HierarchyManagement';
import { MenuManagement } from './components/MenuManagement';
import { RatingsAnalytics } from './components/RatingsAnalytics';
import { ComplaintManagement } from './components/ComplaintManagement';
import { AnnouncementManagement } from './components/AnnouncementManagement';
import { AuditLogViewer } from './components/AuditLogViewer';
import { SystemSettings } from './components/SystemSettings';
import { BackendService } from './services/backend';
import type { 
  UserProfile, 
  Institution, 
  Hostel, 
  Mess, 
  MenuEntry, 
  MealRating, 
  FeedbackComplaint, 
  Announcement, 
  AuditLog 
} from './types/models';

export const App: React.FC = () => {
  const { adminProfile, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'login'>('landing');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Data states
  const [loadingData, setLoadingData] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [messes, setMesses] = useState<Mess[]>([]);
  const [menus, setMenus] = useState<MenuEntry[]>([]);
  const [ratings, setRatings] = useState<MealRating[]>([]);
  const [complaints, setComplaints] = useState<FeedbackComplaint[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [u, inst, h, m, men, r, c, a, l] = await Promise.all([
        BackendService.getUsers(),
        BackendService.getInstitutions(),
        BackendService.getHostels(),
        BackendService.getMesses(),
        BackendService.getMenus(),
        BackendService.getRatings(),
        BackendService.getComplaints(),
        BackendService.getAnnouncements(),
        BackendService.getAuditLogs()
      ]);

      setUsers(u);
      setInstitutions(inst);
      setHostels(h);
      setMesses(m);
      setMenus(men);
      setRatings(r);
      setComplaints(c);
      setAnnouncements(a);
      setAuditLogs(l);
    } catch (e) {
      console.error('Error loading admin backend data:', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!adminProfile) return;

    // Load initial data
    loadAllData();

    // Real-time Firestore subscriptions for live multi-device syncing
    const unsubUsers = BackendService.subscribeUsers((u) => setUsers(u));
    const unsubInstitutions = BackendService.subscribeInstitutions((inst) => setInstitutions(inst));
    const unsubHostels = BackendService.subscribeHostels((h) => setHostels(h));
    const unsubMesses = BackendService.subscribeMesses((m) => setMesses(m));
    const unsubMenus = BackendService.subscribeMenus((men) => setMenus(men));
    const unsubRatings = BackendService.subscribeRatings((r) => setRatings(r));
    const unsubComplaints = BackendService.subscribeComplaints((c) => setComplaints(c));
    const unsubAnnouncements = BackendService.subscribeAnnouncements((a) => setAnnouncements(a));

    return () => {
      unsubUsers();
      unsubInstitutions();
      unsubHostels();
      unsubMesses();
      unsubMenus();
      unsubRatings();
      unsubComplaints();
      unsubAnnouncements();
    };
  }, [adminProfile]);

  useEffect(() => {
    const handleHash = () => {
      const nextView = window.location.hash === '#login' ? 'login' : 'landing';
      setCurrentView(nextView);
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (authLoading && !adminProfile) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!adminProfile) {
    return (
      <div className="w-full min-h-screen transition-opacity duration-150">
        {currentView === 'landing' ? (
          <LandingPage
            onGoToLogin={() => {
              window.location.hash = '#login';
              setCurrentView('login');
            }}
          />
        ) : (
          <LoginScreen
            onBackToLanding={() => {
              window.location.hash = '';
              setCurrentView('landing');
            }}
          />
        )}
      </div>
    );
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return { title: 'Executive Overview', subtitle: 'Hostel meal statistics, inspection summaries & quality indicators' };
      case 'students': return { title: 'Student Directory', subtitle: 'Manage registered students, allocations, and application permissions' };
      case 'incharges': return { title: 'Food Incharge & Inspectors', subtitle: 'Mess staff provisioning, access control, and assigned facilities' };
      case 'hierarchy': return { title: 'Campus Organizations & Messes', subtitle: 'Institutions, student residential halls, and dining facilities' };
      case 'menus': return { title: 'Daily Mess Menu Management', subtitle: 'Breakfast, lunch, evening snacks, and dinner schedules' };
      case 'ratings': return { title: 'Meal Ratings & Food Quality', subtitle: 'Student meal dimension evaluations, trends, and content moderation' };
      case 'complaints': return { title: 'Feedback & Grievances Hub', subtitle: 'Investigate student complaints, assign inspectors, and publish responses' };
      case 'announcements': return { title: 'Campus Announcements', subtitle: 'Publish notices to Android mobile users across mess facilities' };
      case 'audit': return { title: 'Security Audit Logs', subtitle: 'Tamper-evident administrative action history and access trail' };
      case 'settings': return { title: 'System Configuration', subtitle: 'FSSAI standards, verification policies, and shared database diagnostics' };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <div className="flex h-screen bg-slate-100/70 overflow-hidden font-sans">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title={title}
          subtitle={subtitle}
          onRefresh={loadAllData}
          isRefreshing={loadingData}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardOverview
                users={users}
                institutions={institutions}
                messes={messes}
                menus={menus}
                ratings={ratings}
                complaints={complaints}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'students' && (
              <StudentManagement
                students={users.filter((u) => u.role === 'STUDENT')}
                institutions={institutions}
                hostels={hostels}
                messes={messes}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'incharges' && (
              <InchargeManagement
                incharges={users.filter((u) => u.role === 'FOOD_INCHARGE')}
                institutions={institutions}
                messes={messes}
                complaints={complaints}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'hierarchy' && (
              <HierarchyManagement
                institutions={institutions}
                hostels={hostels}
                messes={messes}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'menus' && (
              <MenuManagement
                menus={menus}
                messes={messes}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'ratings' && (
              <RatingsAnalytics
                ratings={ratings}
                messes={messes}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'complaints' && (
              <ComplaintManagement
                complaints={complaints}
                incharges={users.filter((u) => u.role === 'FOOD_INCHARGE')}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'announcements' && (
              <AnnouncementManagement
                announcements={announcements}
                messes={messes}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'audit' && (
              <AuditLogViewer logs={auditLogs} />
            )}

            {activeTab === 'settings' && (
              <SystemSettings />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
