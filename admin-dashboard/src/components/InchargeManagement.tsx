import React, { useState } from 'react';
import type { UserProfile, Institution, Mess, FeedbackComplaint } from '../types/models';
import { BackendService } from '../services/backend';
import { useAuth } from '../context/AuthContext';
import { EmailNotificationService, type WelcomeEmailPayload } from '../services/emailService';
import { 
  ChefHat, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Building2, 
  ShieldCheck, 
  Send, 
  X, 
  Trash2, 
  Edit3,
  ExternalLink,
  Eye,
  Key,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { EmailPreviewModal } from './EmailPreviewModal';
import type { ActiveTab } from './Sidebar';


interface InchargeManagementProps {
  incharges: UserProfile[];
  institutions: Institution[];
  messes: Mess[];
  complaints?: FeedbackComplaint[];
  onNavigateTab?: (tab: ActiveTab) => void;
  onRefresh: () => void;
}

export const InchargeManagement: React.FC<InchargeManagementProps> = ({
  incharges,
  institutions,
  messes,
  complaints = [],
  onNavigateTab,
  onRefresh
}) => {
  const { adminProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showProvisionModal, setShowProvisionModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institutionId, setInstitutionId] = useState(institutions[0]?.id || '');
  const [messId, setMessId] = useState(messes[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitationSentSuccess, setInvitationSentSuccess] = useState<string | null>(null);
  const [emailModalPayload, setEmailModalPayload] = useState<WelcomeEmailPayload | null>(null);
  const [lastCreatedPayload, setLastCreatedPayload] = useState<WelcomeEmailPayload | null>(null);
  const [inchargeToDelete, setInchargeToDelete] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sendingEmailUid, setSendingEmailUid] = useState<string | null>(null);

  const handleSendEmailToIncharge = async (inc: UserProfile, openGmailInTab: boolean = true) => {
    const adminEmail = adminProfile?.email || 'theweber0000@gmail.com';
    const adminName = adminProfile?.name || 'MessUP Campus Administration';

    const payload: WelcomeEmailPayload = {
      recipientName: inc.name,
      recipientEmail: inc.email,
      role: 'FOOD_INCHARGE',
      temporaryPassword: 'Cutm@cit123',
      portalName: 'MessUP Food Incharge Portal',
      assignedMess: inc.messName,
      institutionName: institutions[0]?.name || 'Centurion University of Technology and Management',
      senderEmail: adminEmail,
      senderName: adminName
    };

    setSendingEmailUid(inc.uid);
    try {
      // 1. Dispatch email automatically via Firestore trigger / EmailJS
      await EmailNotificationService.sendWelcomeEmail(payload);

      // 2. Open Gmail compose with admin's Gmail ID automatically
      if (openGmailInTab) {
        const gmailUrl = EmailNotificationService.getGmailComposeUrl(payload, adminEmail);
        window.open(gmailUrl, '_blank');
      }

      setLastCreatedPayload(payload);
      setInvitationSentSuccess(`Automated welcome email with login credentials (Password: "Cutm@cit123") and incharge operations guide dispatched to ${inc.email} from Admin (${adminEmail})!`);
    } catch (err: any) {
      console.error('Failed to send automated email to food incharge:', err);
      alert(`Failed to send email to ${inc.email}: ${err?.message || 'Check network connection'}`);
    } finally {
      setSendingEmailUid(null);
    }
  };

  // Edit Incharge state
  const [editingIncharge, setEditingIncharge] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editMessId, setEditMessId] = useState('');

  const handleOpenEditIncharge = (inc: UserProfile) => {
    setEditingIncharge(inc);
    setEditName(inc.name);
    setEditPhone(inc.phone || '');
    setEditMessId(inc.messId || (messes[0]?.id || ''));
  };

  const handleSaveEditIncharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncharge || !adminProfile) return;
    setIsSubmitting(true);
    try {
      const selectedMess = messes.find((m) => m.id === editMessId);
      const selectedInst = institutions.find((i) => i.id === (editingIncharge.institutionId || institutions[0]?.id));

      await BackendService.editFoodIncharge(
        editingIncharge.uid,
        {
          name: editName.trim(),
          phone: editPhone.trim(),
          messId: editMessId,
          messName: selectedMess?.name || editingIncharge.messName || '',
          institutionId: editingIncharge.institutionId || institutions[0]?.id || '',
          institutionName: selectedInst?.name || editingIncharge.institutionName || ''
        },
        adminProfile.uid
      );
      setInvitationSentSuccess(`Updated food incharge details for ${editName.trim()}! Changes will reflect immediately on mobile and web.`);
      setEditingIncharge(null);
      onRefresh();
    } catch (err) {
      alert('Failed to update food incharge information');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIncharge = async () => {
    if (!inchargeToDelete) return;
    setIsDeleting(true);
    try {
      await BackendService.deleteUser(inchargeToDelete.uid, adminProfile?.uid || 'admin');
      setInchargeToDelete(null);
      onRefresh();
    } catch (err) {
      alert('Failed to delete food incharge');
    } finally {
      setIsDeleting(false);
    }
  };


  // Sync state if options load asynchronously
  React.useEffect(() => {
    if (institutions.length > 0 && !institutionId) {
      setInstitutionId(institutions[0].id);
    }
  }, [institutions, institutionId]);

  React.useEffect(() => {
    if (messes.length > 0 && !messId) {
      setMessId(messes[0].id);
    }
  }, [messes, messId]);

  const filteredIncharges = incharges.filter((inc) => 
    inc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inc.messName && inc.messName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleProvisionIncharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminProfile) return;
    setIsSubmitting(true);
    try {
      const selectedInst = institutions.find((i) => i.id === institutionId);
      const selectedMess = messes.find((m) => m.id === messId);
      const adminEmail = adminProfile?.email || 'theweber0000@gmail.com';

      const { incharge } = await BackendService.provisionFoodIncharge(
        {
          name,
          email,
          phone,
          institutionId,
          institutionName: selectedInst?.name || '',
          messId,
          messName: selectedMess?.name || '',
          adminEmail
        },
        adminProfile.uid
      );

      const payload: WelcomeEmailPayload = {
        recipientName: incharge.name,
        recipientEmail: incharge.email,
        role: 'FOOD_INCHARGE',
        temporaryPassword: 'Cutm@cit123',
        portalName: 'MessUP Food Incharge Portal',
        assignedMess: incharge.messName,
        institutionName: selectedInst?.name || '',
        senderEmail: adminEmail,
        senderName: adminProfile?.name || 'MessUP Campus Administration'
      };

      setLastCreatedPayload(payload);
      setInvitationSentSuccess(`Food Incharge account provisioned for ${incharge.name}! An automated personalized email with login credentials (Password: "Cutm@cit123") and operations guide has been dispatched to ${incharge.email} from Admin (${adminEmail}).`);
      setName('');
      setEmail('');
      setPhone('');
      setShowProvisionModal(false);
      onRefresh();
    } catch (err) {
      alert('Failed to provision food incharge');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSuspend = async (incharge: UserProfile) => {
    if (!adminProfile) return;
    const newSuspendedState = !incharge.isSuspended;
    const msg = newSuspendedState
      ? `Revoke menu management and complaint response access for ${incharge.name}?`
      : `Reactivate Food Incharge account for ${incharge.name}?`;
    
    if (!window.confirm(msg)) return;

    try {
      await BackendService.updateUser(incharge.uid, { isSuspended: newSuspendedState }, adminProfile.uid);
      onRefresh();
    } catch (err) {
      alert('Failed to update incharge status');
    }
  };

  return (
    <div className="space-y-6">
      {invitationSentSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900 shadow-sm animate-fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="text-xs font-bold">{invitationSentSuccess}</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Default password: <code className="bg-emerald-100/80 px-1.5 py-0.5 rounded font-mono font-bold">Cutm@cit123</code>. The email contains complete food incharge portal guidelines.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            {lastCreatedPayload && (
              <>
                <button
                  type="button"
                  onClick={() => setEmailModalPayload(lastCreatedPayload)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-800 rounded-xl text-xs font-bold transition-all shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Preview Email</span>
                </button>
                <a
                  href={EmailNotificationService.getGmailComposeUrl(lastCreatedPayload, adminProfile?.email || 'theweber0000@gmail.com')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Gmail</span>
                </a>
              </>
            )}
            <button 
              onClick={() => {
                setInvitationSentSuccess(null);
                setLastCreatedPayload(null);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full md:w-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search food incharges by name, email, mess..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <button
          onClick={() => setShowProvisionModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Food Incharge</span>
        </button>
      </div>

      {/* Incharges List Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredIncharges.map((inc) => {
          const assignedMess = messes.find((m) => m.id === inc.messId);
          return (
            <div key={inc.uid} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base border border-emerald-100 flex-shrink-0">
                      <ChefHat className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{inc.name}</h4>
                      <p className="text-[11px] font-semibold text-emerald-700">Food Incharge / Inspector</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    inc.isSuspended ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {inc.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{inc.messName || 'Assigned Mess Block'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{inc.email}</span>
                  </div>
                  {inc.phone && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{inc.phone}</span>
                    </div>
                  )}
                </div>

                {/* Active Issues for this Mess Block */}
                {(() => {
                  const inchargeComplaints = complaints.filter(
                    c => (c.messId && inc.messId && c.messId === inc.messId) || c.assignedToInchargeId === inc.uid
                  );
                  const openCount = inchargeComplaints.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length;
                  if (openCount > 0) {
                    return (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200/90 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span className="text-xs font-bold text-amber-900">{openCount} Active Student Issue{openCount > 1 ? 's' : ''}</span>
                        </div>
                        {onNavigateTab && (
                          <button
                            onClick={() => onNavigateTab('complaints')}
                            className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                          >
                            Review &rarr;
                          </button>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div className="mt-3 py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>No pending grievances for this mess</span>
                    </div>
                  );
                })()}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Android Role: <code className="text-emerald-700 font-mono font-bold">FOOD_INCHARGE</code>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleSuspend(inc)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                      inc.isSuspended 
                        ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' 
                        : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    {inc.isSuspended ? 'Reactivate' : 'Revoke'}
                  </button>

                  {/* Automated Email Action with Admin's Gmail ID */}
                  <button
                    onClick={() => handleSendEmailToIncharge(inc, true)}
                    disabled={sendingEmailUid === inc.uid}
                    className={`p-1 rounded-lg border transition-all ${
                      sendingEmailUid === inc.uid
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                        : 'border-emerald-200 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50'
                    }`}
                    title={`Click to automatically send welcome email & credentials from Admin (${adminProfile?.email || 'theweber0000@gmail.com'}) to ${inc.email}`}
                  >
                    {sendingEmailUid === inc.uid ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    ) : (
                      <Mail className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Preview Email Template Action */}
                  <button
                    onClick={() => {
                      const payload: WelcomeEmailPayload = {
                        recipientName: inc.name,
                        recipientEmail: inc.email,
                        role: 'FOOD_INCHARGE',
                        temporaryPassword: 'Cutm@cit123',
                        portalName: 'MessUP Food Incharge Portal',
                        assignedMess: inc.messName,
                        institutionName: institutions[0]?.name || 'Centurion University of Technology and Management',
                        senderEmail: adminProfile?.email || 'theweber0000@gmail.com',
                        senderName: adminProfile?.name || 'MessUP Campus Administration'
                      };
                      setEmailModalPayload(payload);
                    }}
                    className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                    title="Preview Welcome Email & Operations Guide"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEditIncharge(inc)}
                    className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    title="Edit Food Incharge Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setInchargeToDelete(inc)}
                    className="p-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Food Incharge"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );

        })}
      </div>

      {/* Provisioning Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">Provision Food Incharge</h3>
                <p className="text-xs text-slate-500">Authorize staff to publish menus and answer complaints</p>
              </div>
              <button
                onClick={() => setShowProvisionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProvisionIncharge} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Full Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Food Incharge Name"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="incharge@campus.edu"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9812345678"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Assign Mess Facility
                </label>
                <select
                  value={messId}
                  onChange={(e) => setMessId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {messes.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} - {m.location}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <span>Default Password: <code className="bg-emerald-100 font-mono px-1 py-0.5 rounded text-emerald-900">Cutm@cit123</code></span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  An automated personalized email will be immediately dispatched to the user's email address informing them of their Food Incharge portal access, assigned mess, and next steps.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Provisioning...' : 'Authorize Incharge'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Food Incharge Modal */}
      {editingIncharge && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Food Incharge Details</h3>
                <p className="text-xs text-slate-500">{editingIncharge.email}</p>
              </div>
              <button
                onClick={() => setEditingIncharge(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditIncharge} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Full Name / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Food Incharge Name"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 9812345678"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Assigned Mess Facility <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editMessId}
                  onChange={(e) => setEditMessId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {messes.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} - {m.location}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1">
                <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                  ⚡ Updates made here will sync instantly to the Food Inspector's Android application.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingIncharge(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert Modal */}
      <DeleteConfirmModal
        isOpen={!!inchargeToDelete}
        title="Delete Food Incharge"
        itemName={inchargeToDelete ? `${inchargeToDelete.name} (${inchargeToDelete.email})` : ''}
        itemType="food incharge"
        warningText="Are you sure you want to permanently delete this Food Incharge? They will lose access to upload daily menus, approve meal ratings, or respond to student complaints. This action is irreversible."
        isDeleting={isDeleting}
        onConfirm={handleDeleteIncharge}
        onCancel={() => setInchargeToDelete(null)}
      />
      {/* Automated Email Preview Modal */}
      <EmailPreviewModal
        payload={emailModalPayload}
        onClose={() => setEmailModalPayload(null)}
      />
    </div>
  );
};

