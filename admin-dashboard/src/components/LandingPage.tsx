import React from 'react';
import { 
  ArrowRight, 
  Check, 
  Shield, 
  Smartphone, 
  Utensils, 
  Star, 
  AlertCircle, 
  Building2, 
  ChefHat, 
  Clock, 
  FileSpreadsheet,
  Lock,
  Sparkles,
  BarChart3,
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';

interface LandingPageProps {
  onGoToLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToLogin }) => {
  return (
    <div className="relative min-h-screen bg-[#FBFBFA] text-[#0F172A] selection:bg-[#14532D] selection:text-white flex flex-col overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* HERO & ATMOSPHERIC MESSUP LOGO WATERMARK / MESH BACKDROP */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft Radial Brand Gradients */}
        <div className="absolute -top-[12%] left-1/2 -translate-x-1/2 w-[1100px] h-[750px] bg-gradient-to-b from-[#DCFCE7]/70 via-[#F0FDF4]/40 to-transparent blur-3xl opacity-80" />
        <div className="absolute top-[35%] -right-[15%] w-[650px] h-[650px] bg-emerald-100/35 rounded-full blur-[110px]" />
        <div className="absolute top-[60%] -left-[15%] w-[600px] h-[600px] bg-amber-50/50 rounded-full blur-[100px]" />

        {/* Hero Central MessUP Watermark Logo (Floating subtle brand presence) */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 w-[720px] h-[720px] md:w-[900px] md:h-[900px] opacity-[0.045] select-none flex items-center justify-center animate-pulse-glow">
          <img 
            src="/messup_logo.png" 
            alt="MessUP Watermark Logo" 
            className="w-full h-full object-contain filter grayscale contrast-125" 
          />
        </div>

        {/* Ambient Subtle Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(#14532D 1px, transparent 1px)`,
            backgroundSize: '28px 28px'
          }}
        />
      </div>

      {/* Top Banner Notice */}
      <div className="relative z-30 bg-[#0F3D21] text-[#DCFCE7] text-[12px] font-medium py-2 px-4 text-center border-b border-[#14532D]/40 backdrop-blur-sm flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
        <span className="font-semibold text-emerald-300">MessUP 2.0:</span>
        <span>Institutional Dining & Quality Audit Platform — Live on Android & Web</span>
        <button 
          onClick={onGoToLogin} 
          className="ml-3 underline decoration-emerald-400/60 hover:decoration-emerald-300 text-white font-semibold cursor-pointer transition-colors"
        >
          Administrator Log In →
        </button>
      </div>

      {/* Main Glassmorphic Navbar */}
      <header className="relative z-30 sticky top-0 border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
              <img 
                src="/messup_logo.png" 
                alt="MessUP Logo" 
                className="relative w-9 h-9 rounded-xl border border-emerald-200/60 p-1 object-contain bg-white shadow-sm" 
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[#14532D] text-lg tracking-tight block">MessUP</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.2 rounded uppercase tracking-wider">
                  Enterprise
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide block uppercase">Every Meal Matters.</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-[#14532D] transition-colors">Operational Flow</a>
            <a href="#roles" className="hover:text-[#14532D] transition-colors">Access Roles</a>
            <a href="#compliance" className="hover:text-[#14532D] transition-colors">FSSAI Standards</a>
            <a href="#analytics-preview" className="hover:text-[#14532D] transition-colors">Live Metrics</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onGoToLogin}
              className="px-4 py-2 bg-gradient-to-r from-[#14532D] to-[#0F3D21] hover:from-[#166534] hover:to-[#14532D] text-white text-[13px] font-semibold rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 cursor-pointer border border-emerald-700/30"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-300" />
              <span>Admin Console</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-16 md:pt-24 pb-20 px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Mission & Action */}
          <div className="lg:col-span-7 space-y-7">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200 text-[#14532D] text-[12px] font-semibold shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              Official Campus Dining & Meal Audit Platform
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-[50px] font-extrabold text-[#0B132B] leading-[1.14] tracking-tight">
              Transparent menus, verified ratings & rapid dining grievance resolution.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
              MessUP replaces unverified claims and paper forms with a state-of-the-art 
              tri-tier management ecosystem engineered specifically for university hostels and residential dining halls.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
              <button
                onClick={onGoToLogin}
                className="px-6 py-3.5 bg-gradient-to-r from-[#14532D] via-[#166534] to-[#0F3D21] hover:shadow-lg hover:shadow-emerald-900/20 text-white font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer border border-emerald-800/40"
              >
                <span>Launch Admin Dashboard</span>
                <ArrowRight className="w-4 h-4 text-emerald-300" />
              </button>

              <a
                href="#how-it-works"
                className="px-6 py-3.5 bg-white/90 hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-semibold text-sm rounded-xl transition-all text-center shadow-xs hover:border-slate-300"
              >
                Explore System Architecture
              </a>
            </div>

            {/* Credibility Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-6 border-t border-slate-200/80 text-[12px] text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-700" />
                </div>
                <span>One rating / student / meal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-700" />
                </div>
                <span>Private grievance tickets</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-700" />
                </div>
                <span>Immutable audit trails</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-End Interactive Mockup with Logo Watermark Overlay */}
          <div className="lg:col-span-5 relative">
            {/* Glow backing */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500/20 via-transparent to-green-500/20 rounded-3xl blur-xl" />

            <div className="relative space-y-4">
              {/* Photo Card with Mess Dining */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl group bg-white">
                <img 
                  src="/mess_dining.jpg" 
                  alt="University Hostel Mess Dining Hall" 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/50 to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      Live Dining Facility
                    </span>
                    <span className="text-[10px] text-emerald-300 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      450 Active Residents
                    </span>
                  </div>
                  <p className="font-bold text-base leading-tight text-white">Campus Dining Hall & Residential Blocks</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">Automated dietary schedule & real-time quality verification</p>
                </div>
              </div>

              {/* Realistic Live Operations Card */}
              <div className="relative bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden text-xs">
                
                {/* Background Watermark inside Card */}
                <div className="absolute -right-6 -bottom-6 w-48 h-48 opacity-[0.06] pointer-events-none select-none">
                  <img src="/messup_logo.png" alt="" className="w-full h-full object-contain filter grayscale" />
                </div>

                {/* Card Window Bar */}
                <div className="bg-[#0B132B] text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="ml-2 font-semibold text-[11px] text-slate-200 tracking-wide">Campus Mess Live Monitor</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    CLOUD SYNC
                  </span>
                </div>

                {/* Metrics */}
                <div className="p-4 space-y-3.5 bg-slate-50/70">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px] font-medium">Daily Satisfaction</span>
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      </div>
                      <p className="text-xl font-extrabold text-slate-900 mt-1">4.6 <span className="text-[11px] text-slate-400 font-normal">/ 5.0</span></p>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold mt-0.5">
                        <TrendingUp className="w-3 h-3" />
                        <span>↑ 8% this week</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px] font-medium">Grievances Status</span>
                        <Activity className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <p className="text-xl font-extrabold text-slate-900 mt-1">2 <span className="text-[11px] text-slate-400 font-normal">Under Action</span></p>
                      <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">94% resolved &lt; 24h</span>
                    </div>
                  </div>

                  {/* Scheduled Meal Snippet */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-2 shadow-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-[#14532D]" />
                        Today's Special Lunch
                      </span>
                      <span className="bg-emerald-100/80 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] tracking-wide">
                        SERVING NOW
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-1 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Paneer Butter Masala
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 rounded font-medium">Veg</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Jeera Rice & Dal Tadka
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 rounded font-medium">Veg</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Kolhapuri Chicken Curry
                        </span>
                        <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 rounded font-medium">Non-Veg</span>
                      </div>
                    </div>
                  </div>

                  {/* Complaint Notice Alert */}
                  <div className="bg-emerald-50 border border-emerald-200/90 p-3 rounded-xl flex items-start gap-2.5 text-[11px] text-emerald-950">
                    <Shield className="w-4 h-4 flex-shrink-0 text-[#14532D] mt-0.5" />
                    <div>
                      <span className="font-bold block text-[#14532D]">Quality Audit Completed</span>
                      Water filtration UV cartridges sanitized and verified by Hostel Warden.
                    </div>
                  </div>
                </div>

                <div className="bg-white px-4 py-2.5 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between items-center">
                  <span>Authorized by Campus Food Committee</span>
                  <span className="font-semibold text-[#14532D]">Audit Trail #FSSAI-892</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* BRAND EMBLEM SECTION / WATERMARK BANNER */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-10 bg-gradient-to-r from-[#14532D] via-[#0F3D21] to-[#14532D] text-white border-y border-emerald-900 shadow-inner overflow-hidden">
        {/* Subtle Watermark in Ribbon */}
        <div className="absolute right-10 -top-8 w-44 h-44 opacity-10 pointer-events-none">
          <img src="/messup_logo.png" alt="" className="w-full h-full object-contain filter brightness-200" />
        </div>
        
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center flex-shrink-0 shadow-sm">
              <img src="/messup_logo.png" alt="MessUP" className="w-9 h-9 object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white">Engineered for University Campuses & Hostels</h3>
              <p className="text-xs text-emerald-200/80">Connecting students, kitchen contractors, and university deans on a single source of truth.</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-emerald-200 font-medium">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Role-Based Permissions</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Native Android + Web</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* STRUCTURED OPERATIONAL FLOW */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="relative z-10 py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#14532D] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Operational Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-[#0B132B] mt-3">
              How MessUP powers campus dining end-to-end
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              A closed-loop governance cycle designed to eliminate communication breakdowns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative border border-slate-200/80 rounded-2xl p-6 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14532D] to-[#166534] text-white flex items-center justify-center font-bold text-sm mb-4 shadow-sm group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Menu Publishing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kitchen incharges schedule Breakfast, Lunch, Snacks, and Dinner with dish dietary tags (Veg, Non-Veg, Egg).
              </p>
            </div>

            <div className="relative border border-slate-200/80 rounded-2xl p-6 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14532D] to-[#166534] text-white flex items-center justify-center font-bold text-sm mb-4 shadow-sm group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Multi-Axis Ratings</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hostel residents review meals directly on Android across Taste, Hygiene, Freshness, and Serving Quantity.
              </p>
            </div>

            <div className="relative border border-slate-200/80 rounded-2xl p-6 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14532D] to-[#166534] text-white flex items-center justify-center font-bold text-sm mb-4 shadow-sm group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Grievance Escalation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tickets flow from Submitted → Under Review → Action Planned → Resolved, with photographic proof support.
              </p>
            </div>

            <div className="relative border border-slate-200/80 rounded-2xl p-6 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14532D] to-[#166534] text-white flex items-center justify-center font-bold text-sm mb-4 shadow-sm group-hover:scale-110 transition-transform">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Institutional Oversight</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hostel wardens and deans review performance scores, export CSV logs, and enforce vendor SLA penalties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* THREE USER ROLES */}
      {/* ========================================================================= */}
      <section id="roles" className="relative z-10 py-20 max-w-6xl mx-auto px-6 w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#14532D] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Security & Segmentation
          </span>
          <h2 className="text-3xl font-extrabold text-[#0B132B] mt-3">
            Three distinct role boundaries
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Every user experiences a tailored interface protected by strict Firestore rules and role claims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {/* Admin Card */}
          <div className="relative rounded-2xl p-7 bg-white border-2 border-emerald-600/30 shadow-lg flex flex-col justify-between hover:border-emerald-600 transition-all duration-300">
            <div className="absolute -top-3 right-6 bg-[#14532D] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide shadow-sm">
              SUPERVISION PORTAL
            </div>
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-[11px] font-extrabold text-[#14532D] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  ROLE: ADMIN
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Web Dashboard</span>
              </div>
              <h3 className="text-lg font-bold text-[#0B132B] mb-2">Campus Administrator</h3>
              <ul className="text-xs text-slate-600 space-y-2.5 mb-7">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Verify registered students & allocate to designated mess blocks</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Provision food incharges, chef access & staff permissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Manage campuses, hostel blocks, and mess dining facilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Moderation controls & tamper-evident audit logs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>One-click CSV exports for university syndicate reports</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onGoToLogin}
              className="w-full py-2.5 bg-gradient-to-r from-[#14532D] to-[#0F3D21] hover:from-[#166534] hover:to-[#14532D] text-white text-xs font-bold rounded-xl transition-colors text-center cursor-pointer shadow-sm"
            >
              Log in as Administrator →
            </button>
          </div>

          {/* Student Card */}
          <div className="rounded-2xl p-7 bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-[11px] font-extrabold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                  ROLE: STUDENT
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Android App</span>
              </div>
              <h3 className="text-lg font-bold text-[#0B132B] mb-2">Resident Student</h3>
              <ul className="text-xs text-slate-600 space-y-2.5 mb-7">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-600 flex-shrink-0 mt-0.5" />
                  <span>Real-time meal schedule & nutritional indicators</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-600 flex-shrink-0 mt-0.5" />
                  <span>Deterministic one-rating-per-meal to prevent voter skew</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-600 flex-shrink-0 mt-0.5" />
                  <span>Submit public complaints or confidential private reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-600 flex-shrink-0 mt-0.5" />
                  <span>Direct push updates when kitchen takes corrective action</span>
                </li>
              </ul>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 text-center font-medium">
              Requires Admin Mess Block Allocation
            </div>
          </div>

          {/* Food Incharge Card */}
          <div className="rounded-2xl p-7 bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-[11px] font-extrabold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  ROLE: FOOD_INCHARGE
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Android Mobile</span>
              </div>
              <h3 className="text-lg font-bold text-[#0B132B] mb-2">Catering / Incharge</h3>
              <ul className="text-xs text-slate-600 space-y-2.5 mb-7">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Publish daily menu items with dish descriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Cancel meals with mandatory reasons visible to all</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>View student satisfaction analytics across 4 dimensions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Submit official replies to resolve student grievance tickets</span>
                </li>
              </ul>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 text-center font-medium">
              Directly Provisioned by Campus Admin
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* COMPLIANCE & STANDARDS SECTION */}
      {/* ========================================================================= */}
      <section id="compliance" className="relative z-10 py-20 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-12">
            
            <div className="md:col-span-5 relative min-h-[280px]">
              <img 
                src="/food_inspection.jpg" 
                alt="Head Chef and Quality Inspector Reviewing Standards" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/40 hidden md:block" />
            </div>

            <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#14532D] text-[11px] font-bold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  Institutional Governance
                </div>

                <h3 className="text-2xl font-extrabold text-[#0B132B]">
                  FSSAI Standards & Multi-Dimensional Hygiene Audits
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  MessUP structures daily meal evaluations around 4 foundational metrics: 
                  <strong className="text-slate-800"> Taste & Seasoning</strong>, 
                  <strong className="text-slate-800"> Freshness of Ingredients</strong>, 
                  <strong className="text-slate-800"> Serving Cleanliness</strong>, and 
                  <strong className="text-slate-800"> Portion Sufficiency</strong>. 
                  Every inspection log and rating is stored immutably to verify contractor compliance.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60">
                    <span className="text-[11px] text-slate-500 font-medium">Audit Compliance</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">ISO 22000 & FSSAI</p>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60">
                    <span className="text-[11px] text-slate-500 font-medium">Grievance SLA</span>
                    <p className="text-base font-bold text-emerald-700 mt-0.5">&lt; 24h Resolution</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-200 mt-6">
                <div className="text-xs text-slate-500">
                  Implemented for <strong className="text-slate-800">University Campuses & Hostel Dining Facilities</strong>
                </div>
                <button 
                  onClick={onGoToLogin}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#14532D] to-[#0F3D21] hover:from-[#166534] hover:to-[#14532D] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-all"
                >
                  Enter Admin Console →
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ENTERPRISE FOOTER */}
      {/* ========================================================================= */}
      <footer className="relative z-10 bg-[#0B132B] text-slate-400 text-xs border-t border-slate-800 mt-auto">
        
        {/* Subtle Watermark on Footer Right */}
        <div className="absolute right-6 bottom-6 w-60 h-60 opacity-[0.03] pointer-events-none select-none">
          <img src="/messup_logo.png" alt="" className="w-full h-full object-contain filter brightness-200" />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            {/* Col 1 */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center">
                  <img 
                    src="/messup_logo.png" 
                    alt="MessUP Logo" 
                    className="w-7 h-7 object-contain" 
                  />
                </div>
                <div>
                  <span className="font-extrabold text-white text-lg tracking-tight block">MessUP</span>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">Institutional</span>
                </div>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Campus hostel and mess menu management, multi-dimensional food quality ratings, and grievance resolution.
              </p>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  Every Meal Matters.
                </span>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2.5 text-[12px]">
                <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">Operational Flow</a></li>
                <li><a href="#roles" className="hover:text-emerald-400 transition-colors">User Role Boundaries</a></li>
                <li><a href="#compliance" className="hover:text-emerald-400 transition-colors">FSSAI Quality Guidelines</a></li>
                <li><a href="#compliance" className="hover:text-emerald-400 transition-colors">Sanitation & Hygiene Logs</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Architecture</h4>
              <ul className="space-y-2.5 text-[12px]">
                <li><span className="text-slate-300">Android Student App</span> (Jetpack Compose)</li>
                <li><span className="text-slate-300">Incharge Manager</span> (Mobile Web & App)</li>
                <li><span className="text-slate-300">Admin Control Center</span> (React + Vite)</li>
                <li><span className="text-slate-300">Cloud Firestore Infrastructure</span></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Admin Access</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                Strict multi-tenant security with cryptographic audit logs and instant access revocation.
              </p>
              <button
                onClick={onGoToLogin}
                className="w-full py-2.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Authorized Admin Portal</span>
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} MessUP Campus Food Management System. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>FSSAI Compliant Governance</span>
              <span>•</span>
              <button onClick={onGoToLogin} className="hover:text-emerald-400 transition-colors cursor-pointer font-medium">
                Admin Gateway
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
