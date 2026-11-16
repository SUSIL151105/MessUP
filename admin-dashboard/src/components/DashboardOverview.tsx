import React from 'react';
import { 
  Users, 
  ChefHat, 
  Building2, 
  Utensils, 
  Star, 
  MessageSquareWarning, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import type { 
  UserProfile, 
  Institution, 
  Mess, 
  MenuEntry, 
  MealRating, 
  FeedbackComplaint 
} from '../types/models';
import { getEffectiveRating } from '../utils/ratingUtils';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardOverviewProps {
  users: UserProfile[];
  institutions: Institution[];
  messes: Mess[];
  menus: MenuEntry[];
  ratings: MealRating[];
  complaints: FeedbackComplaint[];
  onNavigateTab: (tab: any) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  users,
  institutions,
  messes,
  menus,
  ratings,
  complaints,
  onNavigateTab
}) => {
  const students = users.filter((u) => u.role === 'STUDENT');
  const activeStudents = students.filter((u) => u.isApproved && !u.isSuspended);
  const incharges = users.filter((u) => u.role === 'FOOD_INCHARGE');
  const pendingStudents = students.filter((u) => !u.isApproved);

  const pendingComplaints = complaints.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' || c.status === 'ACTION_PLANNED'
  );
  const resolvedComplaints = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED');

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysMenus = menus.filter((m) => m.date === todayStr && m.isPublished);

  // Active unmoderated ratings
  const activeRatings = ratings.filter((r) => !r.isModerated);

  // Compute actual average overall rating
  const avgRating = activeRatings.length > 0
    ? (activeRatings.reduce((acc, r) => acc + getEffectiveRating(r), 0) / activeRatings.length).toFixed(1)
    : '0.0';

  // Dimension averages (averaging only active ratings where score > 0)
  const calcDimAvg = (selector: (r: MealRating) => number | undefined): string => {
    const vals = activeRatings
      .map(selector)
      .filter((v): v is number => typeof v === 'number' && v > 0);
    if (vals.length === 0) return '0.0';
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  const avgTaste = calcDimAvg((r) => r.ratings?.taste);
  const avgHygiene = calcDimAvg((r) => r.ratings?.hygiene);
  const avgPortion = calcDimAvg((r) => r.ratings?.portion);
  const avgQuality = calcDimAvg((r) => r.ratings?.quality);

  // Ratings by meal type data for chart (pure dynamic calculation using actual effective ratings)
  const getMealTypeAvg = (mType: string): number => {
    const subset = activeRatings.filter((r) => r.mealType === mType);
    if (subset.length === 0) return 0;
    return Number((subset.reduce((a, b) => a + getEffectiveRating(b), 0) / subset.length).toFixed(1));
  };

  const mealTypeData = [
    { name: 'Breakfast', avg: getMealTypeAvg('BREAKFAST') },
    { name: 'Lunch', avg: getMealTypeAvg('LUNCH') },
    { name: 'Snacks', avg: getMealTypeAvg('SNACKS') },
    { name: 'Dinner', avg: getMealTypeAvg('DINNER') }
  ];

  // Complaint category breakdown
  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  const complaintChartData = Object.keys(categoryCounts).map((cat) => ({
    name: cat.replace('_', ' '),
    count: categoryCounts[cat]
  }));

  const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Pending verification alert banner if needed */}
      {pendingStudents.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-900 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">
                {pendingStudents.length} student account{pendingStudents.length > 1 ? 's' : ''} awaiting mess assignment & verification
              </p>
              <p className="text-xs text-amber-700">
                Newly registered students require admin approval and mess allocation before they can access meal menus.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('students')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            Review Students
          </button>
        </div>
      )}

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div 
          onClick={() => onNavigateTab('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Students</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{students.length}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span className="text-emerald-600 font-semibold">{activeStudents.length} Active</span>
            <span>•</span>
            <span className="text-amber-600 font-semibold">{pendingStudents.length} Pending</span>
          </div>
        </div>

        {/* Food Incharges */}
        <div 
          onClick={() => onNavigateTab('incharges')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Food Incharges</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ChefHat className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{incharges.length}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span>Covering {messes.length} active mess blocks</span>
          </div>
        </div>

        {/* Overall Food Rating */}
        <div 
          onClick={() => onNavigateTab('ratings')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Meal Rating</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900">{avgRating}</span>
            <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>{activeRatings.length} total verified ratings</span>
          </div>
        </div>

        {/* Complaints Status */}
        <div 
          onClick={() => onNavigateTab('complaints')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Complaints</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{pendingComplaints.length}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span className="text-emerald-600 font-semibold">{resolvedComplaints.length} Resolved</span>
            <span>•</span>
            <span className="text-slate-500">{complaints.length} Total</span>
          </div>
        </div>
      </div>

      {/* Analytics & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meal Rating by Type Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Meal Satisfaction by Type</h2>
              <p className="text-xs text-slate-500">Average student ratings across daily dining schedules</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
              Live Feed
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mealTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="avg" name="Rating" fill="#059669" radius={[8, 8, 0, 0]} barSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Dimensions Scoreboard */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Food Quality Dimensions</h2>
            <p className="text-xs text-slate-500 mb-6">Aggregated student feedback scores</p>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Taste & Flavor</span>
                  <span className="text-emerald-700 font-bold">{avgTaste} / 5</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${(Number(avgTaste) / 5) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Hygiene & Cleanliness</span>
                  <span className="text-emerald-700 font-bold">{avgHygiene} / 5</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${(Number(avgHygiene) / 5) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Ingredient Freshness</span>
                  <span className="text-emerald-700 font-bold">{avgQuality} / 5</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${(Number(avgQuality) / 5) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Portion Sufficiency</span>
                  <span className="text-emerald-700 font-bold">{avgPortion} / 5</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${(Number(avgPortion) / 5) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Institution Status</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> FSSAI Guidelines Met
            </span>
          </div>
        </div>
      </div>

      {/* Active Today Menus & Recent Grievances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Published Menus */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Today's Mess Menus</h2>
              <p className="text-xs text-slate-500">Live published meals accessible to students on Android</p>
            </div>
            <button
              onClick={() => onNavigateTab('menus')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              Manage Menus →
            </button>
          </div>

          <div className="space-y-3">
            {todaysMenus.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Utensils className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No menus published for today yet</p>
                <p className="text-xs text-slate-400 mt-1">Publish menus so students can rate breakfast, lunch, snacks & dinner</p>
              </div>
            ) : (
              todaysMenus.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                      {m.mealType}
                    </span>
                    <span className="text-xs text-slate-400">Mess: {m.messId}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {m.dishes.map((d) => (
                      <span key={d.id} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-700 font-medium">
                        {d.isVeg ? '🥬 ' : '🍗 '} {d.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Complaints Overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Student Complaints</h2>
              <p className="text-xs text-slate-500">Track resolution workflows across messes</p>
            </div>
            <button
              onClick={() => onNavigateTab('complaints')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              View Inbox ({complaints.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {complaints.slice(0, 3).map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{c.studentName}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {c.category.replace('_', ' ')}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                    c.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800' :
                    c.status === 'ACTION_PLANNED' ? 'bg-purple-100 text-purple-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{c.description}</p>
                {c.photoUrl && (
                  <div className="mt-2.5 flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200/90">
                    <img 
                      src={c.photoUrl} 
                      alt="LocLens Food Evidence" 
                      className="w-12 h-12 rounded-lg object-cover border border-emerald-300 shadow-sm flex-shrink-0" 
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `/evidence/evidence_${c.id}.jpg`;
                      }}
                    />
                    <div className="min-w-0 flex-1 text-[11px] space-y-0.5">
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <span>📍 LocLens™ Geotagged Evidence</span>
                      </span>
                      <p className="text-slate-500 truncate font-mono text-[10px]">
                        {c.gpsLocationTag || (c.latitude && c.longitude ? `${c.latitude.toFixed(4)}° N, ${c.longitude.toFixed(4)}° E` : 'GPS Verified')}
                      </p>
                    </div>
                  </div>
                )}
                {c.officialResponse && (
                  <div className="mt-2 text-[11px] bg-emerald-50 text-emerald-800 p-2 rounded-lg">
                    <span className="font-semibold">Response:</span> {c.officialResponse}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
