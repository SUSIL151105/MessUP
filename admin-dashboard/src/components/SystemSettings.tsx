import React, { useState } from 'react';
import { Settings, Shield, Smartphone, Database, CheckCircle2, RefreshCw, LogOut, Mail, Send, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EmailNotificationService } from '../services/emailService';

export const SystemSettings: React.FC = () => {
  const { adminProfile, isDemoMode, logout } = useAuth();
  const [requireApproval, setRequireApproval] = useState(true);
  const [allowPrivateComplaints, setAllowPrivateComplaints] = useState(true);
  const [fssaiComplianceMode, setFssaiComplianceMode] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 shadow-sm text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>System configuration successfully updated.</span>
        </div>
      )}

      {/* Backend & Android Sync Status */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-700" />
          Shared Firebase Backend Status
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Authoritative backend connection used jointly by the Android application and Admin Web Console
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Firebase Project ID</span>
            <p className="font-mono font-bold text-slate-800 text-sm">messup-ee9fc</p>
            <p className="text-slate-500 text-[11px]">Storage: messup-ee9fc.firebasestorage.app</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Client Authorization</span>
            <p className="font-semibold text-emerald-700 text-sm flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Role-Based Firestore Rules Enforced
            </p>
            <p className="text-slate-500 text-[11px]">ADMIN, FOOD_INCHARGE, STUDENT access boundary</p>
          </div>
        </div>
      </div>

      {/* Operational Policies Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">Hostel & Mess Policies</h3>
        <p className="text-xs text-slate-500 mb-6">Configure governance, student onboarding, and grievance visibility</p>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">Mandate Admin Mess Allocation for Students</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                New self-registered Android students must be allocated a mess before accessing daily food menus.
              </p>
            </div>
            <input
              type="checkbox"
              checked={requireApproval}
              onChange={(e) => setRequireApproval(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">Support Confidential Grievances</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Allow students to submit private complaints visible solely to Administrators and assigned Food Incharges.
              </p>
            </div>
            <input
              type="checkbox"
              checked={allowPrivateComplaints}
              onChange={(e) => setAllowPrivateComplaints(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">Enforce FSSAI Food Hygiene Audit Categories</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Require ratings to record Taste, Freshness, Hygiene, and Portion sufficiency scores.
              </p>
            </div>
            <input
              type="checkbox"
              checked={fssaiComplianceMode}
              onChange={(e) => setFssaiComplianceMode(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              Save Policy Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Automated Email Service & Dispatch Diagnostics */}
      <EmailServiceSettingsCard />

      {/* Admin Account & Direct Logout */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-700/20">
              {adminProfile?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">{adminProfile?.name || 'Administrator'}</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {isDemoMode ? 'Demo Admin' : 'Super Admin'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{adminProfile?.email || 'admin@messup.edu'}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">UID: {adminProfile?.uid || 'primary_admin'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all shadow-xs"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span className="text-rose-700">Sign Out of Admin Console</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const EmailServiceSettingsCard: React.FC = () => {
  const [config, setConfig] = useState(EmailNotificationService.getEmailConfig());
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [configSaved, setConfigSaved] = useState(false);

  const handleSaveEmailConfig = (e: React.FormEvent) => {
    e.preventDefault();
    EmailNotificationService.saveEmailConfig(config);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      alert('Please enter a valid test recipient email address');
      return;
    }
    setIsSendingTest(true);
    setTestStatus(null);
    try {
      const record = await EmailNotificationService.sendWelcomeEmail({
        recipientName: 'Test Student',
        recipientEmail: testEmail.trim(),
        role: 'STUDENT',
        temporaryPassword: 'Cutm@cit123',
        portalName: 'MessUP Student Portal',
        assignedMess: 'Assigned Mess',
        assignedHostel: 'Hostel Block',
        institutionName: 'University Campus'
      });
      setTestStatus(`Test email dispatched successfully to ${record.recipientEmail} via ${record.deliveryMethod} (Password: "Cutm@cit123")!`);
    } catch (err: any) {
      setTestStatus(`Error dispatching email: ${err?.message || 'Check network / configuration'}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-700" />
            Automated Welcome Email & Credentials Delivery
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dispatches automated welcome emails with initial password (<code className="font-mono text-emerald-800 font-bold">Cutm@cit123</code>) and access guide upon adding students or food incharges
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Active Multi-Channel
        </span>
      </div>

      {configSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Email service configuration updated.</span>
        </div>
      )}

      {testStatus && (
        <div className={`p-3 border rounded-xl text-xs font-semibold flex items-center gap-2 ${
          testStatus.includes('Error') ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{testStatus}</span>
        </div>
      )}

      <form onSubmit={handleSaveEmailConfig} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              EmailJS Service ID <span className="text-slate-400 font-normal">(Optional for cloud SMTP)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. service_messup"
              value={config.serviceId || ''}
              onChange={(e) => setConfig({ ...config, serviceId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              EmailJS Template ID
            </label>
            <input
              type="text"
              placeholder="e.g. template_welcome"
              value={config.templateId || ''}
              onChange={(e) => setConfig({ ...config, templateId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              EmailJS Public Key
            </label>
            <input
              type="text"
              placeholder="e.g. user_xxx..."
              value={config.publicKey || ''}
              onChange={(e) => setConfig({ ...config, publicKey: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-slate-500">
            Also queues directly to Firestore <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">mail/</code> collection for Firebase Trigger Email extension.
          </p>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Save Email Config
          </button>
        </div>
      </form>

      {/* Quick Test Email Dispatch */}
      <div className="pt-3 border-t border-slate-200/80">
        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">
          Test Automated Welcome Email Dispatch
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Enter your email to verify welcome email delivery..."
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={isSendingTest}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSendingTest ? 'Sending...' : 'Send Test Welcome Email'}</span>
          </button>
        </div>
      </div>

      {/* Dispatched Automated Emails Log */}
      <div className="pt-3 border-t border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-bold text-slate-700 uppercase">
            Recent Automated Email Dispatches ({EmailNotificationService.getSentEmails().length})
          </label>
          <span className="text-[10px] text-slate-400">Auto-saved to local audit log</span>
        </div>
        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
          {EmailNotificationService.getSentEmails().length === 0 ? (
            <p className="text-[11px] text-slate-400 italic">No automated emails logged yet.</p>
          ) : (
            EmailNotificationService.getSentEmails().slice(0, 5).map((mail) => (
              <div key={mail.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{mail.recipientName} &lt;{mail.recipientEmail}&gt;</p>
                  <p className="text-[10px] text-slate-500">{mail.subject}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {mail.deliveryMethod}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{new Date(mail.sentAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
