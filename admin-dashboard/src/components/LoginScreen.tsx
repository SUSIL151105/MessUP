import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  Lock, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  KeyRound, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  UtensilsCrossed,
  ArrowLeft
} from 'lucide-react';

interface LoginScreenProps {
  onBackToLanding?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBackToLanding }) => {
  const { login, sendPasswordReset, error, clearError, loading } = useAuth();
  const [email, setEmail] = useState('theweber0000@gmail.com');
  const [password, setPassword] = useState('Admin@2030');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('theweber0000@gmail.com');
  const [resetStatus, setResetStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    clearError();
    try {
      await login(email, password);
    } catch (err) {
      // Handled in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!forgotEmail) {
      setResetStatus({ type: 'error', message: 'Please enter your administrator email address.' });
      return;
    }
    setResetSubmitting(true);
    setResetStatus(null);
    try {
      await sendPasswordReset(forgotEmail);
      setResetStatus({
        type: 'success',
        message: `Password reset instructions have been dispatched to ${forgotEmail}. Please check your inbox and spam folder.`
      });
    } catch (err: any) {
      setResetStatus({
        type: 'error',
        message: err.message || 'Unable to send reset email. Please try updating the password directly below.'
      });
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-3 sm:p-6 lg:p-8 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      {/* Refined ambient illumination with deeper, harmonious glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-600/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Delicate background grid overlay for subtle depth */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Floating Header / Return button */}
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="absolute top-5 left-5 z-30 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 backdrop-blur-md shadow-md transition-all duration-200 group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-emerald-400" />
          <span>Return to Home</span>
        </button>
      )}

      {/* Main Glassmorphic Dual-Panel Card */}
      <div className="w-full max-w-4xl bg-slate-900/95 border border-slate-800/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* LEFT PANEL: Photography & Branding Showcase (5 cols on desktop) */}
        <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between p-8 text-white overflow-hidden border-r border-slate-800/80">
          {/* Background dining hall photo */}
          <img 
            src="/mess_dining.jpg" 
            alt="University Hostel Mess Dining" 
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Smooth, high-contrast dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0D1526]/85 to-[#0B1120]/80" />
          <div className="absolute inset-0 bg-emerald-950/20 mix-blend-multiply" />

          {/* Top Brand Watermark & Tag */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-emerald-500/30 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-300">
                Enterprise Portal
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white p-1.5 shadow-lg border border-slate-700 flex items-center justify-center">
                <img src="/messup_logo.png" alt="MessUP Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Mess<span className="text-emerald-400">UP</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ADMIN
                  </span>
                </h2>
                <p className="text-[11px] text-slate-300">Hostel Dining Operations</p>
              </div>
            </div>
          </div>

          {/* Mid Section Highlights */}
          <div className="relative z-10 my-auto py-6 space-y-3.5">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 backdrop-blur-md">
              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                &ldquo;Every student meal verified, every kitchen audited. Bringing transparent dining operations and dietary safety across all campus hostels.&rdquo;
              </p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Realtime Cloud Database Sync</span>
              </div>
            </div>

            {/* Quick Badges */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 backdrop-blur-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="text-[11px] leading-tight">
                  <div className="font-semibold text-white">Multi-Hostel</div>
                  <div className="text-slate-400 text-[10px]">Boys & Girls Wings</div>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 backdrop-blur-sm flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="text-[11px] leading-tight">
                  <div className="font-semibold text-white">Daily Menus</div>
                  <div className="text-slate-400 text-[10px]">Meal-by-Meal Audit</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>TLS 1.3 256-Bit Encrypted</span>
            </span>
            <span className="text-slate-500 font-mono text-[10px]">v2.4.0 PROD</span>
          </div>
        </div>

        {/* RIGHT PANEL: Clean, High-Contrast Form (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col justify-center p-6 sm:p-10 lg:p-12 relative z-10 bg-[#0F172A]/90">
          
          {/* Mobile-Only Header Brand Bar */}
          <div className="lg:hidden flex items-center gap-3 pb-5 border-b border-slate-800 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-md border border-slate-700 flex items-center justify-center">
              <img src="/messup_logo.png" alt="MessUP Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Mess<span className="text-emerald-400">UP</span> Admin
              </h2>
              <p className="text-xs text-slate-400">Hostel Dining Operations</p>
            </div>
          </div>

          <div className="max-w-md w-full mx-auto">
            {/* Title & Introduction */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Admin Sign In
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                Enter your administrative credentials to manage hostels, menus, and rosters.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1 leading-snug font-medium">
                  {error}
                </div>
                <button 
                  onClick={clearError}
                  className="text-rose-400 hover:text-rose-200 text-[10px] uppercase font-bold p-0.5 rounded cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@institution.edu"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setResetStatus(null);
                      setShowForgotModal(true);
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer focus:outline-none transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 text-emerald-100" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Note */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Authorized Personnel Only</span>
              </span>
              <span className="text-[11px] text-slate-500">Firebase Auth v10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot / Reset Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowForgotModal(false);
                setResetStatus(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Admin Password</h3>
                <p className="text-xs text-slate-400">Receive a recovery link via administrator email</p>
              </div>
            </div>

            {/* Feedback Status */}
            {resetStatus && (
              <div
                className={`mb-4 p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                  resetStatus.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {resetStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
                )}
                <div className="flex-1 leading-relaxed font-medium">{resetStatus.message}</div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendResetEmail();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Admin Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@institution.edu"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  A password reset link will be dispatched to this inbox. Click the link to define a new password.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetStatus(null);
                  }}
                  className="w-1/3 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="w-2/3 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {resetSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Reset Email</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
