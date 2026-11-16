import React, { useState } from 'react';
import type { UserProfile, Institution, Hostel, Mess } from '../types/models';
import { BackendService } from '../services/backend';
import { EmailNotificationService, type WelcomeEmailPayload } from '../services/emailService';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  Download, 
  Edit3, 
  UserCheck, 
  RotateCcw,
  Check,
  X,
  Phone,
  Mail,
  Plus,
  Key,
  ShieldCheck,
  Trash2,
  ExternalLink,
  Eye,
  Loader2,
  Send
} from 'lucide-react';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { EmailPreviewModal } from './EmailPreviewModal';


interface StudentManagementProps {
  students: UserProfile[];
  institutions: Institution[];
  hostels: Hostel[];
  messes: Mess[];
  onRefresh: () => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  institutions,
  hostels,
  messes,
  onRefresh
}) => {
  const { adminProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'SUSPENDED'>('ALL');
  const [messFilter, setMessFilter] = useState<string>('ALL');
  
  // Edit Student / Assignment Modal
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [targetName, setTargetName] = useState<string>('');
  const [targetPhone, setTargetPhone] = useState<string>('');
  const [targetMessId, setTargetMessId] = useState<string>('');
  const [targetHostelId, setTargetHostelId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Student Modal State
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newHostelId, setNewHostelId] = useState(hostels[0]?.id || '');
  const [newMessId, setNewMessId] = useState(messes[0]?.id || '');
  const [studentCreatedSuccess, setStudentCreatedSuccess] = useState<string | null>(null);
  const [emailModalPayload, setEmailModalPayload] = useState<WelcomeEmailPayload | null>(null);
  const [lastCreatedPayload, setLastCreatedPayload] = useState<WelcomeEmailPayload | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sendingEmailUid, setSendingEmailUid] = useState<string | null>(null);

  const handleSendEmailToStudent = async (student: UserProfile, openGmailInTab: boolean = true) => {
    const adminEmail = adminProfile?.email || 'theweber0000@gmail.com';
    const adminName = adminProfile?.name || 'MessUP Campus Administration';

    const payload: WelcomeEmailPayload = {
      recipientName: student.name,
      recipientEmail: student.email,
      role: 'STUDENT',
      temporaryPassword: 'Cutm@cit123',
      portalName: 'MessUP Student Dining Portal',
      assignedMess: student.messName,
      assignedHostel: student.hostelName,
      institutionName: institutions[0]?.name || 'Centurion University of Technology and Management',
      senderEmail: adminEmail,
      senderName: adminName
    };

    setSendingEmailUid(student.uid);
    try {
      // 1. Dispatch automated welcome email via Firebase mail collection / EmailJS
      await EmailNotificationService.sendWelcomeEmail(payload);

      // 2. Open Gmail compose with admin's Gmail ID automatically
      if (openGmailInTab) {
        const gmailUrl = EmailNotificationService.getGmailComposeUrl(payload, adminEmail);
        window.open(gmailUrl, '_blank');
      }

      setLastCreatedPayload(payload);
      setStudentCreatedSuccess(`Automated welcome email with login credentials (Password: "Cutm@cit123") and application guide dispatched to ${student.email} from Admin (${adminEmail})!`);
    } catch (err: any) {
      console.error('Failed to send automated email to student:', err);
      alert(`Failed to send email to ${student.email}: ${err?.message || 'Check network connection'}`);
    } finally {
      setSendingEmailUid(null);
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await BackendService.deleteUser(studentToDelete.uid, adminProfile?.uid || 'admin');
      setStudentToDelete(null);
      onRefresh();
    } catch (err) {
      alert('Failed to delete student');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone && s.phone.includes(searchTerm)) ||
      (s.hostelName && s.hostelName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'APPROVED' ? (s.isApproved && !s.isSuspended) :
      statusFilter === 'PENDING' ? !s.isApproved :
      s.isSuspended;

    const matchesMess = messFilter === 'ALL' || s.messId === messFilter;

    return matchesSearch && matchesStatus && matchesMess;
  });

  const handleApprove = async (student: UserProfile) => {
    if (!adminProfile) return;
    setIsSubmitting(true);
    try {
      await BackendService.updateUser(student.uid, { isApproved: true, isSuspended: false }, adminProfile.uid);
      const adminEmail = adminProfile?.email || 'theweber0000@gmail.com';
      // Dispatch automated approval notification email to student with admin's Gmail ID
      EmailNotificationService.sendApprovalEmail({
        name: student.name,
        email: student.email,
        messName: student.messName,
        hostelName: student.hostelName,
        institutionName: institutions[0]?.name
      }, adminEmail).catch((e) => console.warn('Approval email notification notice:', e));

      setStudentCreatedSuccess(`Student ${student.name} approved! An automated verification email has been dispatched to ${student.email} from Admin (${adminEmail}).`);
      onRefresh();
    } catch (err) {
      alert('Failed to approve student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSuspend = async (student: UserProfile) => {
    if (!adminProfile) return;
    const newSuspendedState = !student.isSuspended;
    const confirmMsg = newSuspendedState
      ? `Are you sure you want to suspend student ${student.name}? They will lose access to the MessUP Android application.`
      : `Reactivate student account for ${student.name}?`;
    
    if (!window.confirm(confirmMsg)) return;

    setIsSubmitting(true);
    try {
      await BackendService.updateUser(student.uid, { isSuspended: newSuspendedState }, adminProfile.uid);
      onRefresh();
    } catch (err) {
      alert('Failed to update suspension status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminProfile) return;
    if (!newName.trim() || !newEmail.trim()) {
      alert('Please fill in student name and email');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedHostel = hostels.find((h) => h.id === newHostelId);
      const selectedMess = messes.find((m) => m.id === newMessId);
      const adminEmail = adminProfile?.email || 'theweber0000@gmail.com';

      const { student } = await BackendService.createStudent(
        {
          name: newName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim(),
          hostelId: newHostelId || undefined,
          hostelName: selectedHostel?.name || undefined,
          messId: newMessId || undefined,
          messName: selectedMess?.name || undefined,
          institutionId: institutions[0]?.id || undefined,
          institutionName: institutions[0]?.name || '',
          adminEmail
        },
        adminProfile.uid
      );

      const payload: WelcomeEmailPayload = {
        recipientName: student.name,
        recipientEmail: student.email,
        role: 'STUDENT',
        temporaryPassword: 'Cutm@cit123',
        portalName: 'MessUP Student Dining Portal',
        assignedMess: student.messName,
        assignedHostel: student.hostelName,
        institutionName: institutions[0]?.name || '',
        senderEmail: adminEmail,
        senderName: adminProfile?.name || 'MessUP Campus Administration'
      };

      setLastCreatedPayload(payload);
      setStudentCreatedSuccess(`Student ${student.name} registered! An automated welcome email with login credentials (Password: "Cutm@cit123") and student app usage guide has been dispatched to ${student.email} from Admin (${adminEmail}).`);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setShowAddStudent(false);
      onRefresh();
    } catch (err) {
      alert('Failed to add student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAssignment = async () => {
    if (!selectedStudent || !adminProfile) return;
    setIsSubmitting(true);
    try {
      const resolvedMessId = targetMessId || selectedStudent.messId || (messes[0]?.id || '');
      const selectedMess = messes.find((m) => m.id === resolvedMessId) || messes.find((m) => m.name === selectedStudent.messName) || messes[0];
      
      const resolvedHostelId = targetHostelId || selectedStudent.hostelId || (hostels[0]?.id || '');
      const selectedHostel = hostels.find((h) => h.id === resolvedHostelId) || hostels.find((h) => h.name === selectedStudent.hostelName) || hostels[0];

      const inst = institutions.find(i => i.id === selectedStudent.institutionId) || institutions[0];
      const updates: Partial<UserProfile> = {
        name: targetName.trim() || selectedStudent.name,
        phone: targetPhone.trim() || undefined,
        institutionId: selectedStudent.institutionId || inst?.id || '',
        institutionName: selectedStudent.institutionName || inst?.name || '',
        messId: selectedMess ? selectedMess.id : resolvedMessId,
        messName: selectedMess?.name || selectedStudent.messName || '',
        hostelId: selectedHostel ? selectedHostel.id : resolvedHostelId,
        hostelName: selectedHostel?.name || selectedStudent.hostelName || '',
        isApproved: true // Approving upon explicit assignment
      };

      await BackendService.updateUser(selectedStudent.uid, updates, adminProfile.uid);
      setStudentCreatedSuccess(`Updated student details for ${updates.name}: Mess [${updates.messName}] | Hostel [${updates.hostelName}]. Changes will reflect immediately on mobile.`);
      setSelectedStudent(null);
      onRefresh();
    } catch (err) {
      alert('Failed to save assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportCSV = () => {
    const headers = ['UID', 'Name', 'Email', 'Phone', 'Hostel', 'Mess', 'Approved', 'Suspended', 'RegisteredDate'];
    const rows = filteredStudents.map(s => [
      s.uid,
      `"${s.name}"`,
      s.email,
      s.phone || '',
      `"${s.hostelName || ''}"`,
      `"${s.messName || ''}"`,
      s.isApproved ? 'YES' : 'NO',
      s.isSuspended ? 'YES' : 'NO',
      new Date(s.createdAt).toISOString()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `messup_students_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Student Created & Automated Email Success Banner */}
      {studentCreatedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900 shadow-sm animate-fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="text-xs font-bold">{studentCreatedSuccess}</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Default password: <code className="bg-emerald-100/80 px-1.5 py-0.5 rounded font-mono font-bold">Cutm@cit123</code>. The email contains full student app instructions.
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
                setStudentCreatedSuccess(null);
                setLastCreatedPayload(null);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Controls & Search Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full md:w-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students by name, email, phone, hostel..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['ALL', 'APPROVED', 'PENDING', 'SUSPENDED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Mess Filter */}
          <select
            value={messFilter}
            onChange={(e) => setMessFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Mess Blocks</option>
            {messes.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {/* Add Student Button */}
          <button
            onClick={() => {
              setNewHostelId(hostels[0]?.id || '');
              setNewMessId(messes[0]?.id || '');
              setShowAddStudent(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>

          {/* Export button */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Student Information</th>
                <th className="py-3.5 px-4">Hostel / Room</th>
                <th className="py-3.5 px-4">Assigned Mess</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No students match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.uid} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            {student.name}
                            {student.isSuspended && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                                SUSPENDED
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" /> {student.email}
                            </span>
                            {student.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" /> {student.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs font-medium text-slate-700">
                      {student.hostelName || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>

                    <td className="py-4 px-4 text-xs font-semibold text-emerald-800">
                      {student.messName || <span className="text-amber-600 italic">Not Assigned</span>}
                    </td>

                    <td className="py-4 px-4">
                      {student.isSuspended ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" /> Suspended
                        </span>
                      ) : student.isApproved ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Verified & Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          <UserCheck className="w-3.5 h-3.5 text-amber-600" /> Pending Review
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Approve Quick Action */}
                        {!student.isApproved && (
                          <button
                            onClick={() => handleApprove(student)}
                            disabled={isSubmitting}
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-300 transition-colors"
                            title="Approve & Activate"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {/* Automated Email Action with Admin's Gmail ID */}
                        <button
                          onClick={() => handleSendEmailToStudent(student, true)}
                          disabled={sendingEmailUid === student.uid}
                          className={`p-1.5 rounded-lg border transition-all ${
                            sendingEmailUid === student.uid
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                              : 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200'
                          }`}
                          title={`Click to automatically send welcome email & credentials from Admin (${adminProfile?.email || 'theweber0000@gmail.com'}) to ${student.email}`}
                        >
                          {sendingEmailUid === student.uid ? (
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          ) : (
                            <Mail className="w-4 h-4" />
                          )}
                        </button>

                        {/* Preview Email Template Action */}
                        <button
                          onClick={() => {
                            const payload: WelcomeEmailPayload = {
                              recipientName: student.name,
                              recipientEmail: student.email,
                              role: 'STUDENT',
                              temporaryPassword: 'Cutm@cit123',
                              portalName: 'MessUP Student Dining Portal',
                              assignedMess: student.messName,
                              assignedHostel: student.hostelName,
                              institutionName: institutions[0]?.name || 'Centurion University of Technology and Management',
                              senderEmail: adminProfile?.email || 'theweber0000@gmail.com',
                              senderName: adminProfile?.name || 'MessUP Campus Administration'
                            };
                            setEmailModalPayload(payload);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
                          title="Preview Welcome Email & Credentials"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Student / Reassign Mess & Hostel Action */}
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setTargetName(student.name);
                            setTargetPhone(student.phone || '');
                            setTargetMessId(student.messId || (messes[0]?.id || ''));
                            setTargetHostelId(student.hostelId || (hostels[0]?.id || ''));
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                          title="Edit Student Profile & Allocations"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Suspend or Unsuspend */}
                        <button
                          onClick={() => handleToggleSuspend(student)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            student.isSuspended
                              ? 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                              : 'text-amber-600 border-amber-200 hover:bg-amber-50'
                          }`}
                          title={student.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                        >
                          {student.isSuspended ? <RotateCcw className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                        </button>

                        {/* Delete Student Action */}
                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))

              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Student Profile & Assignment Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Student Details</h3>
                <p className="text-xs text-slate-500">{selectedStudent.email}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                  Assigned Hostel Block
                </label>
                <select
                  value={targetHostelId}
                  onChange={(e) => setTargetHostelId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {hostels.length === 0 ? (
                    <option value="">No hostels registered</option>
                  ) : (
                    hostels.map((h) => (
                      <option key={h.id} value={h.id}>{h.name} ({h.block || 'Main'})</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                  Allocated Mess Hall
                </label>
                <select
                  value={targetMessId}
                  onChange={(e) => setTargetMessId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {messes.length === 0 ? (
                    <option value="">No mess halls registered</option>
                  ) : (
                    messes.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} - {m.location}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                ⚡ Saving will immediately update the student's name, profile, meal menus and rating entitlements on their Android app.
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssignment}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  {isSubmitting ? 'Saving...' : 'Save Student Details'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Student</h3>
                <p className="text-xs text-slate-500">Register and allocate student to campus mess</p>
              </div>
              <button
                onClick={() => setShowAddStudent(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul.sharma@campus.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {hostels.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Hostel Hall
                  </label>
                  <select
                    value={newHostelId}
                    onChange={(e) => setNewHostelId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Hostel (Optional)</option>
                    {hostels.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {messes.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Allocated Mess
                  </label>
                  <select
                    value={newMessId}
                    onChange={(e) => setNewMessId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Mess (Optional)</option>
                    {messes.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Password & Automated Email Policy Note */}
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Default Password: <code className="bg-emerald-100 font-mono px-1 py-0.5 rounded text-emerald-900">Cutm@cit123</code></span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Upon adding, a personalized welcome email will be automatically sent to the student's email with login details, application instructions, and privacy reset guidance.
                </p>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  {isSubmitting ? 'Registering...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Student Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!studentToDelete}
        title="Delete Student Account"
        itemName={studentToDelete ? `${studentToDelete.name} (${studentToDelete.email})` : ''}
        itemType="student"
        warningText="Are you sure you want to permanently delete this student? They will immediately lose access to the MessUP Android application, their registered feedback/complaints will remain archived, and this action cannot be undone."
        isDeleting={isDeleting}
        onConfirm={handleDeleteStudent}
        onCancel={() => setStudentToDelete(null)}
      />
      {/* Automated Email Preview Modal */}
      <EmailPreviewModal
        payload={emailModalPayload}
        onClose={() => setEmailModalPayload(null)}
      />
    </div>
  );
};

