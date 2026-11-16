import React, { useState } from 'react';
import type { Announcement, Mess, NoticePriority } from '../types/models';
import { BackendService } from '../services/backend';
import { useAuth } from '../context/AuthContext';
import { Megaphone, Plus, Bell, Calendar, UserCheck, X, Trash2 } from 'lucide-react';
import { DeleteConfirmModal } from './DeleteConfirmModal';


interface AnnouncementManagementProps {
  announcements: Announcement[];
  messes: Mess[];
  onRefresh: () => void;
}

export const AnnouncementManagement: React.FC<AnnouncementManagementProps> = ({
  announcements,
  messes,
  onRefresh
}) => {
  const { adminProfile } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<NoticePriority>('NORMAL');
  const [messId, setMessId] = useState<string>(messes[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAnnouncement = async () => {
    if (!announcementToDelete) return;
    setIsDeleting(true);
    try {
      await BackendService.deleteAnnouncement(announcementToDelete.id, adminProfile?.uid || 'admin');
      setAnnouncementToDelete(null);
      onRefresh();
    } catch (e) {
      alert('Failed to delete announcement');
    } finally {
      setIsDeleting(false);
    }
  };


  React.useEffect(() => {
    if (messes.length > 0 && !messId) {
      setMessId(messes[0].id);
    }
  }, [messes, messId]);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminProfile) return;
    setIsSubmitting(true);
    try {
      await BackendService.createAnnouncement(
        {
          title,
          content,
          priority,
          messId,
          createdBy: adminProfile.uid,
          createdByName: adminProfile.name || 'Central Mess Admin'
        },
        adminProfile.uid,
        adminProfile.name
      );

      setTitle('');
      setContent('');
      setShowCreateModal(false);
      onRefresh();
    } catch (e) {
      alert('Failed to publish announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Broadcast Announcements</h2>
          <p className="text-xs text-slate-500">Publish notices visible instantly on Student & Incharge Android notices boards</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Announcements List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  ann.priority === 'URGENT' ? 'bg-rose-100 text-rose-700' :
                  ann.priority === 'IMPORTANT' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {ann.priority} NOTICE
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(ann.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-base mt-2.5">{ann.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">{ann.content}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>By {ann.createdByName} (Target: {ann.messId})</span>
              <button
                onClick={() => setAnnouncementToDelete(ann)}
                className="p-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete Announcement"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Broadcast Notice</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Notice Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Festival Dinner Schedule"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Target Mess</label>
                <select
                  value={messId}
                  onChange={(e) => setMessId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  {messes.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as NoticePriority)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="IMPORTANT">Important</option>
                  <option value="URGENT">Urgent Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Notice Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide detailed information for students..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  {isSubmitting ? 'Broadcasting...' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Announcement Confirmation Alert */}
      <DeleteConfirmModal
        isOpen={!!announcementToDelete}
        title="Delete Announcement"
        itemName={announcementToDelete?.title || ''}
        itemType="announcement"
        warningText="Are you sure you want to delete this announcement? It will be removed from all student mobile feeds and notice boards immediately."
        isDeleting={isDeleting}
        onConfirm={handleDeleteAnnouncement}
        onCancel={() => setAnnouncementToDelete(null)}
      />
    </div>
  );
};

