import React, { useState } from 'react';
import type { FeedbackComplaint, UserProfile, ComplaintStatus, FeedbackCategory } from '../types/models';
import { BackendService } from '../services/backend';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquareWarning, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  Send, 
  UserCheck, 
  Download,
  AlertTriangle,
  Lock,
  X,
  Trash2,
  Camera,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { DeleteConfirmModal } from './DeleteConfirmModal';


interface ComplaintManagementProps {
  complaints: FeedbackComplaint[];
  incharges: UserProfile[];
  onRefresh: () => void;
}

export const ComplaintManagement: React.FC<ComplaintManagementProps> = ({
  complaints,
  incharges,
  onRefresh
}) => {
  const { adminProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [photoOnlyFilter, setPhotoOnlyFilter] = useState<boolean>(false);

  // Selected complaint for review modal
  const [activeComplaint, setActiveComplaint] = useState<FeedbackComplaint | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>('SUBMITTED');
  const [assignedInchargeId, setAssignedInchargeId] = useState<string>('');
  const [officialResponse, setOfficialResponse] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState<FeedbackComplaint | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lightbox view for full-resolution LocLens photo evidence
  const [evidencePhotoToView, setEvidencePhotoToView] = useState<FeedbackComplaint | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const getImageSrc = (c: FeedbackComplaint): string => {
    if (failedImages[c.id]) {
      return `/evidence/evidence_${c.id}.jpg`;
    }
    if (c.photoUrl && (c.photoUrl.startsWith('data:image') || c.photoUrl.startsWith('http'))) {
      return c.photoUrl;
    }
    return `/evidence/evidence_${c.id}.jpg`;
  };

  const handleDeleteComplaint = async () => {
    if (!complaintToDelete) return;
    setIsDeleting(true);
    try {
      await BackendService.deleteComplaint(complaintToDelete.id, adminProfile?.uid || 'admin');
      setComplaintToDelete(null);
      onRefresh();
    } catch (e) {
      alert('Failed to delete complaint');
    } finally {
      setIsDeleting(false);
    }
  };


  const CATEGORY_LIST: FeedbackCategory[] = [
    'FOOD_QUALITY',
    'HYGIENE',
    'SERVICE',
    'TIMINGS',
    'PORTION_SIZE',
    'MENU_VARIETY',
    'OTHER'
  ];

  const filteredComplaints = complaints.filter((c) => {
    const studentName = (c.studentName || '').toLowerCase();
    const description = (c.description || '').toLowerCase();
    const response = (c.officialResponse || '').toLowerCase();
    const id = (c.id || '').toLowerCase();
    const query = searchTerm.toLowerCase().trim();

    const matchesSearch = !query || 
      studentName.includes(query) ||
      description.includes(query) ||
      response.includes(query) ||
      id.includes(query);

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchesPhoto = !photoOnlyFilter || !!c.photoUrl;

    return matchesSearch && matchesStatus && matchesCategory && matchesPhoto;
  });

  const handleOpenReview = (c: FeedbackComplaint) => {
    setActiveComplaint(c);
    setSelectedStatus(c.status);
    setAssignedInchargeId(c.assignedToInchargeId || (incharges[0]?.uid || ''));
    setOfficialResponse(c.officialResponse || '');
    setInternalNotes(c.internalAdminNotes || '');
  };

  const handleSaveComplaint = async () => {
    if (!activeComplaint || !adminProfile) return;
    setIsSubmitting(true);
    try {
      const assignedIncharge = incharges.find((i) => i.uid === assignedInchargeId);

      const updates: Partial<FeedbackComplaint> = {
        status: selectedStatus,
        assignedToInchargeId: assignedInchargeId || undefined,
        assignedToInchargeName: assignedIncharge?.name || undefined,
        officialResponse: officialResponse.trim() || undefined,
        respondedBy: adminProfile.name,
        respondedAt: Date.now(),
        internalAdminNotes: internalNotes.trim() || undefined
      };

      await BackendService.updateComplaint(
        activeComplaint.id,
        updates,
        adminProfile.uid,
        adminProfile.name
      );

      setActiveComplaint(null);
      onRefresh();
    } catch (e) {
      alert('Failed to update complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportComplaintsCSV = () => {
    const headers = ['ComplaintID', 'Student', 'Category', 'Mess', 'Status', 'Date', 'Description', 'Response'];
    const rows = filteredComplaints.map(c => [
      c.id,
      `"${c.studentName}"`,
      c.category,
      c.messId,
      c.status,
      c.date,
      `"${c.description.replace(/"/g, '""')}"`,
      `"${(c.officialResponse || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `messup_complaints_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const STATUS_LIST: ComplaintStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'ACTION_PLANNED', 'RESOLVED', 'CLOSED'];

  return (
    <div className="space-y-6">
      {/* Controls Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full md:w-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search complaints by student name, issue text, replies..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Categories</option>
            {CATEGORY_LIST.map((cat) => (
              <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            {STATUS_LIST.map((st) => (
              <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setPhotoOnlyFilter(!photoOnlyFilter)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              photoOnlyFilter 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20' 
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Geotagged Photo Only {complaints.filter(c => !!c.photoUrl).length > 0 ? `(${complaints.filter(c => !!c.photoUrl).length})` : ''}</span>
          </button>

          <button
            onClick={exportComplaintsCSV}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">ID / Student</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Grievance Description</th>
                <th className="py-3.5 px-4">LocLens™ GPS Evidence</th>
                <th className="py-3.5 px-4">Assigned / Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No complaints matching filters.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id || Math.random().toString()} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <span className="text-xs font-mono font-bold text-emerald-800">{c.id}</span>
                      <p className="font-semibold text-slate-900 text-xs mt-0.5">{c.studentName || 'Student'}</p>
                      <p className="text-[11px] text-slate-400">{c.date || 'Recent'}</p>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {(c.category || 'FOOD_QUALITY').replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-4 max-w-sm text-xs">
                      <p className="text-slate-800 line-clamp-2 leading-relaxed">{c.description || 'No description provided'}</p>
                      {c.officialResponse && (
                        <p className="text-[11px] text-emerald-700 font-medium mt-1">
                          ↳ <span className="font-semibold">{c.respondedBy || 'Staff'}:</span> {c.officialResponse}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {c.photoUrl ? (
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => setEvidencePhotoToView(c)}
                            className="relative group cursor-pointer w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-400/80 shadow-sm flex-shrink-0 bg-slate-900 transition-all hover:ring-2 hover:ring-emerald-500 hover:ring-offset-1 text-left"
                            title="Click to view full-resolution LocLens™ geotagged photo proof"
                          >
                            <img
                              src={getImageSrc(c)}
                              alt="LocLens Evidence"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                              onError={() => setFailedImages(prev => ({ ...prev, [c.id]: true }))}
                            />
                            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/15 flex items-center justify-center transition-colors">
                              <Maximize2 className="w-4 h-4 text-white drop-shadow opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                            </div>
                          </button>

                          <div className="text-xs space-y-1 min-w-0">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>GPS Verified</span>
                            </span>
                            {c.gpsLocationTag ? (
                              <p className="text-[11px] text-slate-600 line-clamp-2 max-w-[210px] font-mono leading-tight">
                                {c.gpsLocationTag}
                              </p>
                            ) : c.latitude && c.longitude ? (
                              <p className="text-[11px] text-slate-600 font-mono">
                                {c.latitude.toFixed(4)}° N, {c.longitude.toFixed(4)}° E
                              </p>
                            ) : null}
                            {c.latitude && c.longitude && (
                              <a
                                href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-800 font-bold hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MapPin className="w-2.5 h-2.5" />
                                <span>Verify on Map ↗</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                          <Camera className="w-4 h-4 text-slate-300" />
                          <span className="text-[11px]">No photo</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800' :
                        c.status === 'ACTION_PLANNED' ? 'bg-purple-100 text-purple-800' :
                        c.status === 'CLOSED' ? 'bg-slate-100 text-slate-600' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {(c.status || 'SUBMITTED').replace(/_/g, ' ')}
                      </span>
                      {c.assignedToInchargeName && (
                        <p className="text-[11px] text-slate-500 mt-1">
                          Incharge: {c.assignedToInchargeName}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.photoUrl && (
                          <button
                            type="button"
                            onClick={() => setEvidencePhotoToView(c)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl border border-emerald-300 transition-colors flex items-center gap-1 shadow-sm"
                            title="View LocLens Geotagged Evidence Photo"
                          >
                            <Camera className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Photo Proof</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenReview(c)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl border border-emerald-200 transition-colors"
                        >
                          Review & Respond
                        </button>
                        <button
                          onClick={() => setComplaintToDelete(c)}
                          className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                          title="Delete Complaint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Complaint Review Modal */}
      {activeComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header (Fixed at top) */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70 flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">Review Complaint #{activeComplaint.id}</h3>
                <p className="text-xs text-slate-500">Submitted by {activeComplaint.studentName || 'Student'} on {activeComplaint.date || 'Recent'}</p>
              </div>
              <button onClick={() => setActiveComplaint(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* Grievance detail */}
              <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-800 space-y-1.5 border border-slate-200/60">
                <span className="font-bold text-slate-600 uppercase text-[10px] block">Grievance Issue:</span>
                <p className="leading-relaxed">{activeComplaint.description || 'No grievance description provided.'}</p>
              </div>

              {/* LocLens GPS Evidence Proof */}
              {activeComplaint.photoUrl && (
                <div className="bg-slate-900 rounded-xl overflow-hidden border border-emerald-500/40 shadow-sm">
                  <div className="px-3 py-2 bg-slate-950 border-b border-emerald-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[11px] uppercase tracking-wide">LocLens™ Geotagged Photo Evidence</span>
                    </div>
                    {activeComplaint.latitude && activeComplaint.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${activeComplaint.latitude},${activeComplaint.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Google Maps ↗</span>
                      </a>
                    )}
                  </div>
                  <div 
                    onClick={() => setEvidencePhotoToView(activeComplaint)}
                    className="relative group max-h-56 overflow-hidden bg-black flex items-center justify-center cursor-pointer"
                  >
                    <img
                      src={getImageSrc(activeComplaint)}
                      alt="Food Issue Evidence"
                      className="max-h-56 w-full object-contain"
                      onError={() => setFailedImages(prev => ({ ...prev, [activeComplaint.id]: true }))}
                    />
                    <div className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 backdrop-blur-sm shadow">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Expand Proof</span>
                    </div>
                  </div>
                  {activeComplaint.gpsLocationTag && (
                    <div className="p-2.5 bg-slate-950 text-xs border-t border-slate-800/80">
                      <p className="font-mono text-[11px] text-emerald-300">
                        {activeComplaint.gpsLocationTag}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Form Controls */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Status Workflow</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                    >
                      {STATUS_LIST.map((st) => (
                        <option key={st} value={st}>{st.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Assign Responsible Incharge</label>
                    <select
                      value={assignedInchargeId}
                      onChange={(e) => setAssignedInchargeId(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Unassigned</option>
                      {incharges.map((i) => (
                        <option key={i.uid} value={i.uid}>{i.name} ({i.messName})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Official Response to Student (Visible on Android App)
                  </label>
                  <textarea
                    rows={3}
                    value={officialResponse}
                    onChange={(e) => setOfficialResponse(e.target.value)}
                    placeholder="e.g. Mess staff has inspected the dispenser and replaced the filter."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Internal Administrative Notes (Private to Admins)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Notes for hostel staff and records only..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer (Fixed at bottom) */}
            <div className="flex gap-3 p-4 border-t border-slate-100 bg-slate-50/70 flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveComplaint(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveComplaint}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Update Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LocLens Full Evidence Photo Lightbox Modal */}
      {evidencePhotoToView && (
        <div 
          onClick={() => setEvidencePhotoToView(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>LocLens™ Verified Evidence</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                      #{evidencePhotoToView.id}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Reported by {evidencePhotoToView.studentName || 'Student'} • {evidencePhotoToView.date}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEvidencePhotoToView(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo View */}
            <div className="bg-black p-3 flex items-center justify-center max-h-[60vh] overflow-hidden">
              <img 
                src={getImageSrc(evidencePhotoToView)} 
                alt="LocLens Food Issue Proof" 
                className="max-h-[56vh] max-w-full object-contain rounded-lg shadow-inner"
                onError={() => setFailedImages(prev => ({ ...prev, [evidencePhotoToView.id]: true }))}
              />
            </div>

            {/* Location & Metadata Bar */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Verified Geotagged Location (Compulsory LocLens™)</span>
                  </span>
                  <p className="text-xs text-slate-200 font-mono leading-relaxed">
                    {evidencePhotoToView.gpsLocationTag || (
                      evidencePhotoToView.latitude && evidencePhotoToView.longitude
                        ? `${evidencePhotoToView.latitude.toFixed(5)}° N, ${evidencePhotoToView.longitude.toFixed(5)}° E`
                        : 'GPS Coordinates Attached'
                    )}
                  </p>
                </div>

                {evidencePhotoToView.latitude && evidencePhotoToView.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${evidencePhotoToView.latitude},${evidencePhotoToView.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors whitespace-nowrap"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Google Maps</span>
                  </a>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Category: <strong className="text-slate-200">{(evidencePhotoToView.category || '').replace(/_/g, ' ')}</strong></span>
                <span>Meal: <strong className="text-slate-200">{evidencePhotoToView.mealType || 'General'}</strong></span>
                <span>Status: <strong className="text-emerald-400">{(evidencePhotoToView.status || '').replace(/_/g, ' ')}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Complaint Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!complaintToDelete}
        title="Delete Student Complaint"
        itemName={complaintToDelete ? `${complaintToDelete.id} - ${complaintToDelete.studentName} (${complaintToDelete.category})` : ''}
        itemType="complaint"
        warningText="Are you sure you want to permanently delete this student complaint? It will be removed from all administrative records, metrics, and student history."
        isDeleting={isDeleting}
        onConfirm={handleDeleteComplaint}
        onCancel={() => setComplaintToDelete(null)}
      />
    </div>
  );
};

