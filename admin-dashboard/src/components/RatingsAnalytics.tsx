import React, { useState } from 'react';
import type { MealRating, Mess, MealType } from '../types/models';
import { BackendService } from '../services/backend';
import { useAuth } from '../context/AuthContext';
import { 
  Star, 
  Search, 
  Filter, 
  Flag, 
  CheckCircle, 
  TrendingUp, 
  AlertCircle,
  X,
  Edit,
  Trash2,
  Plus,
  RotateCcw,
  Sparkles,
  Calculator,
  ShieldCheck,
  Check
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { getEffectiveRating } from '../utils/ratingUtils';
import { getLocalDateString } from '../utils/menuUtils';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface RatingsAnalyticsProps {
  ratings: MealRating[];
  messes: Mess[];
  onRefresh: () => void;
}

const STANDARD_TAGS = [
  'Good taste',
  'Fresh food',
  'Clean dining',
  'Sufficient portion',
  'Good variety',
  'Cold food',
  'Too spicy',
  'Too salty',
  'Excellent meal'
];

export const RatingsAnalytics: React.FC<RatingsAnalyticsProps> = ({
  ratings,
  messes,
  onRefresh
}) => {
  const { adminProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [mealTypeFilter, setMealTypeFilter] = useState<string>('ALL');
  const [messFilter, setMessFilter] = useState<string>('ALL');
  const [moderationFilter, setModerationFilter] = useState<string>('ALL');

  // Edit / Add Rating Modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isNewRating, setIsNewRating] = useState(false);
  const [editingRatingId, setEditingRatingId] = useState<string>('');
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentId, setEditStudentId] = useState('');
  const [editMessId, setEditMessId] = useState(messes[0]?.id || 'MESS_001');
  const [editDate, setEditDate] = useState(getLocalDateString());
  const [editMealType, setEditMealType] = useState<MealType>('BREAKFAST');
  const [editTaste, setEditTaste] = useState<number>(4.0);
  const [editQuality, setEditQuality] = useState<number>(4.0);
  const [editHygiene, setEditHygiene] = useState<number>(4.0);
  const [editPortion, setEditPortion] = useState<number>(4.0);
  const [editOverall, setEditOverall] = useState<number>(4.0);
  const [editComment, setEditComment] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [editIsModerated, setEditIsModerated] = useState(false);
  const [editModerationReason, setEditModerationReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Quick Moderation Modal state
  const [moderatingRating, setModeratingRating] = useState<MealRating | null>(null);
  const [moderationReason, setModerationReason] = useState('');
  const [isSubmittingModeration, setIsSubmittingModeration] = useState(false);

  // Delete Rating state
  const [ratingToDelete, setRatingToDelete] = useState<MealRating | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredRatings = ratings.filter((r) => {
    const matchesSearch = 
      (r.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.comment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.tags && r.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesMeal = mealTypeFilter === 'ALL' || r.mealType === mealTypeFilter;
    const matchesMess = messFilter === 'ALL' || r.messId === messFilter;
    const matchesMod = 
      moderationFilter === 'ALL' || 
      (moderationFilter === 'FLAGGED' ? r.isModerated : !r.isModerated);

    return matchesSearch && matchesMeal && matchesMess && matchesMod;
  });

  const handleOpenAddRating = () => {
    setIsNewRating(true);
    setEditingRatingId('');
    setEditStudentName('');
    setEditStudentId('STU_' + Date.now().toString().slice(-6));
    setEditMessId(messes[0]?.id || 'MESS_001');
    setEditDate(getLocalDateString());
    setEditMealType('BREAKFAST');
    setEditTaste(4.5);
    setEditQuality(4.5);
    setEditHygiene(4.5);
    setEditPortion(4.0);
    setEditOverall(4.5);
    setEditComment('');
    setEditTags(['Good taste', 'Fresh food']);
    setEditIsModerated(false);
    setEditModerationReason('');
    setIsEditorOpen(true);
  };

  const handleOpenEditRating = (rating: MealRating) => {
    setIsNewRating(false);
    setEditingRatingId(rating.id);
    setEditStudentName(rating.studentName || '');
    setEditStudentId(rating.studentId || '');
    setEditMessId(rating.messId || messes[0]?.id || 'MESS_001');
    setEditDate(rating.date || getLocalDateString());
    setEditMealType(rating.mealType || 'BREAKFAST');
    setEditTaste(rating.ratings?.taste ?? 4.0);
    setEditQuality(rating.ratings?.quality ?? 4.0);
    setEditHygiene(rating.ratings?.hygiene ?? 4.0);
    setEditPortion(rating.ratings?.portion ?? 4.0);
    setEditOverall(getEffectiveRating(rating));
    setEditComment(rating.comment || '');
    setEditTags(rating.tags ? [...rating.tags] : []);
    setEditIsModerated(rating.isModerated || false);
    setEditModerationReason(rating.moderationReason || '');
    setIsEditorOpen(true);
  };

  const handleToggleTag = (tag: string) => {
    if (editTags.includes(tag)) {
      setEditTags(editTags.filter((t) => t !== tag));
    } else {
      setEditTags([...editTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !editTags.includes(trimmed)) {
      setEditTags([...editTags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleAutoCalcOverall = () => {
    const avg = Number(((editTaste + editQuality + editHygiene + editPortion) / 4).toFixed(1));
    setEditOverall(avg);
  };

  const handleSaveRating = async () => {
    if (!adminProfile) return;
    if (!editStudentName.trim()) {
      alert('Please enter a student name.');
      return;
    }

    setIsSaving(true);
    try {
      const dimensionsPayload = {
        taste: Number(editTaste),
        quality: Number(editQuality),
        hygiene: Number(editHygiene),
        portion: Number(editPortion),
        overall: Number(editOverall)
      };

      if (isNewRating) {
        await BackendService.createRating(
          {
            studentId: editStudentId.trim() || 'ADMIN_ENTRY',
            studentName: editStudentName.trim(),
            messId: editMessId,
            date: editDate,
            mealType: editMealType,
            ratings: dimensionsPayload,
            tags: editTags,
            comment: editComment.trim(),
            isModerated: editIsModerated,
            moderationReason: editIsModerated ? editModerationReason.trim() : undefined
          },
          adminProfile.uid
        );
      } else {
        await BackendService.updateRating(
          editingRatingId,
          {
            studentName: editStudentName.trim(),
            messId: editMessId,
            date: editDate,
            mealType: editMealType,
            ratings: dimensionsPayload,
            tags: editTags,
            comment: editComment.trim(),
            isModerated: editIsModerated,
            moderationReason: editIsModerated ? editModerationReason.trim() : undefined
          },
          adminProfile.uid
        );
      }

      setIsEditorOpen(false);
      onRefresh();
    } catch (e) {
      console.error('Error saving rating:', e);
      alert('Failed to save rating changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // Moderation Handlers
  const handleModerate = async () => {
    if (!moderatingRating || !adminProfile || !moderationReason.trim()) return;
    setIsSubmittingModeration(true);
    try {
      await BackendService.moderateRating(
        moderatingRating.id,
        true,
        moderationReason.trim(),
        adminProfile.uid
      );
      setModeratingRating(null);
      setModerationReason('');
      onRefresh();
    } catch (e) {
      alert('Failed to moderate rating');
    } finally {
      setIsSubmittingModeration(false);
    }
  };

  const handleRestoreRating = async (rating: MealRating) => {
    if (!adminProfile) return;
    if (!window.confirm('Restore this rating into public analytics?')) return;
    try {
      await BackendService.moderateRating(rating.id, false, '', adminProfile.uid);
      onRefresh();
    } catch (e) {
      alert('Failed to restore rating');
    }
  };

  const handleConfirmDelete = async () => {
    if (!ratingToDelete || !adminProfile) return;
    setIsDeleting(true);
    try {
      await BackendService.deleteRating(ratingToDelete.id, adminProfile.uid);
      setRatingToDelete(null);
      onRefresh();
    } catch (e) {
      alert('Failed to delete rating');
    } finally {
      setIsDeleting(false);
    }
  };

  // Dimensions comparison for chart (exclude moderated and average only active positive ratings)
  const activeRatings = ratings.filter((r) => !r.isModerated);

  const calcDimAvg = (selector: (r: MealRating) => number | undefined): string => {
    const vals = activeRatings
      .map(selector)
      .filter((v): v is number => typeof v === 'number' && v > 0);
    if (vals.length === 0) return '0.0';
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  const tasteAvg = calcDimAvg((r) => r.ratings?.taste);
  const qualityAvg = calcDimAvg((r) => r.ratings?.quality);
  const hygieneAvg = calcDimAvg((r) => r.ratings?.hygiene);
  const portionAvg = calcDimAvg((r) => r.ratings?.portion);

  const overallAvg = activeRatings.length > 0
    ? (activeRatings.reduce((sum, r) => sum + getEffectiveRating(r), 0) / activeRatings.length).toFixed(1)
    : '0.0';

  const dimensionsData = [
    { name: 'Taste & Flavor', score: Number(tasteAvg) },
    { name: 'Food Quality', score: Number(qualityAvg) },
    { name: 'Mess Hygiene', score: Number(hygieneAvg) },
    { name: 'Portion Size', score: Number(portionAvg) }
  ];

  return (
    <div className="space-y-6">
      {/* Top Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Overall Score */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-2xl text-white shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">
              Overall Rating
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold">{overallAvg}</span>
              <span className="text-xs text-emerald-200">/ 5.0</span>
            </div>
          </div>
          <div className="text-[11px] text-emerald-100 mt-3 pt-2 border-t border-emerald-500/40 flex items-center justify-between">
            <span>{activeRatings.length} Active Reviews</span>
            <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
          </div>
        </div>

        {/* Taste */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Taste & Flavor</span>
            <p className="text-2xl font-bold text-slate-900 mt-2">{tasteAvg} <span className="text-xs text-slate-400">/ 5</span></p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${(Number(tasteAvg)/5)*100}%` }} />
          </div>
        </div>

        {/* Quality */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Food Freshness</span>
            <p className="text-2xl font-bold text-slate-900 mt-2">{qualityAvg} <span className="text-xs text-slate-400">/ 5</span></p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${(Number(qualityAvg)/5)*100}%` }} />
          </div>
        </div>

        {/* Hygiene */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mess Sanitation</span>
            <p className="text-2xl font-bold text-slate-900 mt-2">{hygieneAvg} <span className="text-xs text-slate-400">/ 5</span></p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${(Number(hygieneAvg)/5)*100}%` }} />
          </div>
        </div>

        {/* Portion */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Portion Size</span>
            <p className="text-2xl font-bold text-slate-900 mt-2">{portionAvg} <span className="text-xs text-slate-400">/ 5</span></p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${(Number(portionAvg)/5)*100}%` }} />
          </div>
        </div>
      </div>

      {/* Toolbar with Search, Filters & "Add Rating" Button */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full md:w-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ratings by student name, review comments, or tags..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Meal Filter */}
          <select
            value={mealTypeFilter}
            onChange={(e) => setMealTypeFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Meals</option>
            <option value="BREAKFAST">Breakfast</option>
            <option value="LUNCH">Lunch</option>
            <option value="SNACKS">Snacks</option>
            <option value="DINNER">Dinner</option>
          </select>

          {/* Mess Filter */}
          <select
            value={messFilter}
            onChange={(e) => setMessFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Messes</option>
            {messes.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {/* Moderation Filter */}
          <select
            value={moderationFilter}
            onChange={(e) => setModerationFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Public</option>
            <option value="FLAGGED">Flagged / Moderated</option>
          </select>

          {/* Add Rating Action */}
          <button
            onClick={handleOpenAddRating}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Rating</span>
          </button>
        </div>
      </div>

      {/* Ratings Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Student / Date</th>
                <th className="py-3.5 px-4">Meal & Mess</th>
                <th className="py-3.5 px-4">Dimension Scores</th>
                <th className="py-3.5 px-4">Review & Tags</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredRatings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    No meal ratings matching criteria.
                  </td>
                </tr>
              ) : (
                filteredRatings.map((rating) => {
                  const effectiveScore = getEffectiveRating(rating);
                  return (
                    <tr key={rating.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-900">{rating.studentName || 'Student'}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{rating.date}</div>
                        {rating.studentId && (
                          <span className="text-[10px] text-slate-400 font-mono">{rating.studentId}</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                          {rating.mealType}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">{rating.messId}</p>
                      </td>

                      <td className="py-4 px-4 text-xs">
                        <div className="flex items-center gap-1 font-bold text-amber-600 mb-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{effectiveScore.toFixed(1)} Overall</span>
                        </div>
                        <div className="text-[11px] text-slate-500 space-x-1">
                          <span>Taste: <strong>{rating.ratings?.taste ?? '-'}</strong></span>
                          <span>•</span>
                          <span>Fresh: <strong>{rating.ratings?.quality ?? '-'}</strong></span>
                          <span>•</span>
                          <span>Clean: <strong>{rating.ratings?.hygiene ?? '-'}</strong></span>
                          <span>•</span>
                          <span>Portion: <strong>{rating.ratings?.portion ?? '-'}</strong></span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs max-w-sm">
                        {rating.comment ? (
                          <p className="text-slate-800 italic mb-1.5">"{rating.comment}"</p>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No written review</span>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {rating.tags?.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium border border-slate-200/60">
                              {t}
                            </span>
                          ))}
                        </div>
                        {rating.isModerated && (
                          <div className="mt-1.5 p-1.5 bg-rose-50 border border-rose-200 rounded text-[10px] text-rose-700 flex items-center gap-1">
                            <Flag className="w-3 h-3 text-rose-600 flex-shrink-0" />
                            <span><strong>Flagged:</strong> {rating.moderationReason || 'Inappropriate review'}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Rating Button */}
                          <button
                            onClick={() => handleOpenEditRating(rating)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Edit Rating Review"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Moderate / Flag or Restore Button */}
                          {rating.isModerated ? (
                            <button
                              onClick={() => handleRestoreRating(rating)}
                              className="px-2 py-1 rounded-lg text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="Restore to Public"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => setModeratingRating(rating)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Flag / Moderate Content"
                            >
                              <Flag className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Rating Button */}
                          <button
                            onClick={() => setRatingToDelete(rating)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Rating"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Rating Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/60">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isNewRating ? 'Log New Meal Rating' : 'Edit Rating Review'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time sync to Mobile Applications & Cloud Analytics
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Student & Mess Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    value={editStudentName}
                    onChange={(e) => setEditStudentName(e.target.value)}
                    placeholder="Student Full Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Student UID / ID
                  </label>
                  <input
                    type="text"
                    value={editStudentId}
                    onChange={(e) => setEditStudentId(e.target.value)}
                    placeholder="Student User ID"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Mess, Date, Meal Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Mess Hall
                  </label>
                  <select
                    value={editMessId}
                    onChange={(e) => setEditMessId(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    {messes.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Meal Date
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Meal Slot
                  </label>
                  <select
                    value={editMealType}
                    onChange={(e) => setEditMealType(e.target.value as MealType)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="BREAKFAST">Breakfast</option>
                    <option value="LUNCH">Lunch</option>
                    <option value="SNACKS">Snacks</option>
                    <option value="DINNER">Dinner</option>
                  </select>
                </div>
              </div>

              {/* Dimension Scores Sliders */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Rating Dimensions (1.0 to 5.0)
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoCalcOverall}
                    className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                    title="Calculate overall score as average of the 4 dimensions"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Average to Overall</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Taste */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Taste & Flavor</span>
                      <span className="font-bold text-emerald-700">{editTaste.toFixed(1)} / 5</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.5"
                      value={editTaste}
                      onChange={(e) => setEditTaste(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  {/* Quality */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Food Quality & Freshness</span>
                      <span className="font-bold text-emerald-700">{editQuality.toFixed(1)} / 5</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.5"
                      value={editQuality}
                      onChange={(e) => setEditQuality(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  {/* Hygiene */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Sanitation & Hygiene</span>
                      <span className="font-bold text-emerald-700">{editHygiene.toFixed(1)} / 5</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.5"
                      value={editHygiene}
                      onChange={(e) => setEditHygiene(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  {/* Portion */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Portion Sufficiency</span>
                      <span className="font-bold text-emerald-700">{editPortion.toFixed(1)} / 5</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.5"
                      value={editPortion}
                      onChange={(e) => setEditPortion(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Overall Score Slider */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between text-xs font-bold text-slate-900 mb-1">
                    <span className="flex items-center gap-1 text-amber-700">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>Overall Rating Score</span>
                    </span>
                    <span className="text-sm font-extrabold text-amber-600">{editOverall.toFixed(1)} / 5.0</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={editOverall}
                    onChange={(e) => setEditOverall(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Written Comment / Review */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Student Review / Comment
                </label>
                <textarea
                  rows={3}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder="e.g. Delicious hot chapatis and creamy dal. Clean dining area."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              {/* Tags Management */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">
                  Feedback Tags ({editTags.length})
                </label>
                {/* Standard tag pills */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {STANDARD_TAGS.map((tag) => {
                    const isSelected = editTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleToggleTag(tag)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Tag Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTag();
                      }
                    }}
                    placeholder="Add custom tag (e.g. Extra Butter)..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Moderation Controls */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsModerated}
                    onChange={(e) => setEditIsModerated(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Flag this rating review as Moderated / Inappropriate</span>
                </label>

                {editIsModerated && (
                  <div>
                    <input
                      type="text"
                      placeholder="Reason for moderation (e.g. Abusive language, false review)"
                      value={editModerationReason}
                      onChange={(e) => setEditModerationReason(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs text-rose-900 focus:ring-2 focus:ring-rose-500 font-medium"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRating}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save & Sync with Android'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Moderation Modal */}
      {moderatingRating && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Moderate Rating Review</h3>
              <button onClick={() => setModeratingRating(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl mb-4 text-xs text-slate-700">
              <p className="font-semibold">{moderatingRating.studentName}:</p>
              <p className="italic mt-1">"{moderatingRating.comment || 'No comment'}"</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Reason for Moderation (Required)
                </label>
                <textarea
                  required
                  rows={3}
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  placeholder="e.g. Inappropriate language, spam, abusive content..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                🛡️ All moderation actions preserve the original score in administrative audit logs.
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModeratingRating(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleModerate}
                  disabled={isSubmittingModeration || !moderationReason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingModeration ? 'Moderating...' : 'Confirm Moderation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {ratingToDelete && (
        <DeleteConfirmModal
          isOpen={true}
          title="Delete Meal Rating?"
          itemName={`Review by ${ratingToDelete.studentName} for ${ratingToDelete.mealType}`}
          itemType="rating"
          warningText="Permanently remove this rating record. The aggregate mess scores will be recalculated automatically across the mobile app and admin dashboard."
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setRatingToDelete(null)}
        />
      )}
    </div>
  );
};
