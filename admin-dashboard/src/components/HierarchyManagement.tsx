import React, { useState } from 'react';
import type { Institution, Hostel, Mess } from '../types/models';
import { BackendService } from '../services/backend';
import { useAuth } from '../context/AuthContext';
import { Building, Home, Utensils, Plus, MapPin, Users, X, Trash2, Edit2 } from 'lucide-react';
import { DeleteConfirmModal } from './DeleteConfirmModal';


interface HierarchyManagementProps {
  institutions: Institution[];
  hostels: Hostel[];
  messes: Mess[];
  onRefresh: () => void;
}

export const HierarchyManagement: React.FC<HierarchyManagementProps> = ({
  institutions,
  hostels,
  messes,
  onRefresh
}) => {
  const { adminProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'messes' | 'hostels' | 'institutions'>('messes');

  // Modals
  const [showAddMess, setShowAddMess] = useState(false);
  const [editingMess, setEditingMess] = useState<Mess | null>(null);
  const [showAddHostel, setShowAddHostel] = useState(false);
  const [showAddInst, setShowAddInst] = useState(false);

  // Forms
  const [messName, setMessName] = useState('');
  const [messLocation, setMessLocation] = useState('');
  const [messCapacity, setMessCapacity] = useState(400);

  const [hostelName, setHostelName] = useState('');
  const [hostelBlock, setHostelBlock] = useState('');

  const [instName, setInstName] = useState('');
  const [instCode, setInstCode] = useState('');
  const [instLocation, setInstLocation] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deletion Modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    type: 'mess' | 'hostel' | 'institution';
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const adminUid = adminProfile?.uid || 'admin_primary';
    try {
      if (deleteTarget.type === 'mess') {
        await BackendService.deleteMess(deleteTarget.id, adminUid);
      } else if (deleteTarget.type === 'hostel') {
        await BackendService.deleteHostel(deleteTarget.id, adminUid);
      } else if (deleteTarget.type === 'institution') {
        await BackendService.deleteInstitution(deleteTarget.id, adminUid);
      }
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      alert(`Failed to delete ${deleteTarget.type}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateMess = async (e: React.FormEvent) => {

    e.preventDefault();
    if (!messName.trim()) {
      alert('Please enter a mess name');
      return;
    }
    const adminUid = adminProfile?.uid || 'admin_primary';
    setIsSubmitting(true);
    try {
      await BackendService.createMess(
        {
          name: messName.trim(),
          location: messLocation.trim() || 'Campus Central',
          institutionId: institutions[0]?.id || 'INST_001',
          inchargeUid: '',
          capacity: Number(messCapacity) || 400
        },
        adminUid
      );
      setMessName('');
      setMessLocation('');
      setShowAddMess(false);
      onRefresh();
    } catch (e: any) {
      console.error('Error creating mess:', e);
      alert('Failed to add mess: ' + (e.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMess) return;
    if (!messName.trim()) {
      alert('Please enter a mess name');
      return;
    }
    const adminUid = adminProfile?.uid || 'admin_primary';
    setIsSubmitting(true);
    try {
      await BackendService.updateMess(
        editingMess.id,
        {
          name: messName.trim(),
          location: messLocation.trim() || 'Campus Central',
          capacity: Number(messCapacity) || 400
        },
        adminUid
      );
      setEditingMess(null);
      setMessName('');
      setMessLocation('');
      onRefresh();
    } catch (e: any) {
      console.error('Error updating mess:', e);
      alert('Failed to update mess: ' + (e.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostelName.trim()) {
      alert('Please enter a hostel name');
      return;
    }
    const adminUid = adminProfile?.uid || 'admin_primary';
    setIsSubmitting(true);
    try {
      await BackendService.createHostel(
        {
          name: hostelName.trim(),
          block: hostelBlock.trim() || 'Main Wing',
          institutionId: institutions[0]?.id || 'INST_001',
          capacity: 500
        },
        adminUid
      );
      setHostelName('');
      setHostelBlock('');
      setShowAddHostel(false);
      onRefresh();
    } catch (e: any) {
      console.error('Error creating hostel:', e);
      alert('Failed to add hostel: ' + (e.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instName.trim() || !instCode.trim()) {
      alert('Please provide both Institution Name and Institution Code.');
      return;
    }
    const adminUid = adminProfile?.uid || 'admin_primary';
    setIsSubmitting(true);
    try {
      await BackendService.createInstitution(
        {
          name: instName.trim(),
          code: instCode.trim().toUpperCase(),
          location: instLocation.trim() || 'Main Campus'
        },
        adminUid
      );
      setInstName('');
      setInstCode('');
      setInstLocation('');
      setShowAddInst(false);
      onRefresh();
    } catch (e: any) {
      console.error('Error creating institution:', e);
      alert('Failed to add institution: ' + (e.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs & Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('messes')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'messes' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Messes ({messes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hostels')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'hostels' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Hostels ({hostels.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('institutions')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'institutions' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Institutions ({institutions.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {messes.length === 0 && (
            <button
              onClick={async () => {
                await BackendService.initializeCampusFacilities(adminProfile?.uid || 'admin');
                onRefresh();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-300 cursor-pointer"
            >
              <span>Setup CUTM Facilities</span>
            </button>
          )}

          <button
            onClick={() => {
              if (activeTab === 'messes') setShowAddMess(true);
              else if (activeTab === 'hostels') setShowAddHostel(true);
              else setShowAddInst(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New {activeTab === 'messes' ? 'Mess' : activeTab === 'hostels' ? 'Hostel' : 'Institution'}</span>
          </button>
        </div>
      </div>

      {/* Messes View */}
      {activeTab === 'messes' && (
        messes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Mess Dining Blocks Registered</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Set up campus dining facilities to assign students and food incharges for daily operations.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={async () => {
                  await BackendService.initializeCampusFacilities(adminProfile?.uid || 'admin');
                  onRefresh();
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Initialize CUTM Campus Infrastructure</span>
              </button>
              <button
                onClick={() => setShowAddMess(true)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Mess</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {messes.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                    {m.id}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-base mt-3">{m.name}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {m.location}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Incharge: </span>
                    <span className="font-semibold text-emerald-800">
                      {m.inchargeName || (m.inchargeUid ? 'Assigned' : 'Vacant')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingMess(m);
                        setMessName(m.name);
                        setMessLocation(m.location);
                        setMessCapacity(m.capacity || 400);
                      }}
                      className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="Edit Mess"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ id: m.id, name: m.name, type: 'mess' })}
                      className="p-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Mess"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

          </div>
        )
      )}

      {/* Hostels View */}
      {activeTab === 'hostels' && (
        hostels.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-3">
              <Home className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Hostel Halls Registered</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Organize student residences into blocks and wings to manage meal allocations.
            </p>
            <button
              onClick={() => setShowAddHostel(true)}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Hostel</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {hostels.map((h) => (
              <div key={h.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-3">
                      <Home className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                      {h.id}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{h.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{h.block || 'Residential Block'}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Capacity: {h.capacity || 400}</span>
                  <button
                    onClick={() => setDeleteTarget({ id: h.id, name: h.name, type: 'hostel' })}
                    className="p-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Hostel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Institutions View */}
      {activeTab === 'institutions' && (
        institutions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-3">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Institutions Configured</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your university campus, college, or institute to anchor mess facilities and student records.
            </p>
            <button
              onClick={() => setShowAddInst(true)}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Educational Institution</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {institutions.map((i) => (
              <div key={i.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                      <Building className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                        {i.code}
                      </span>
                      <button
                        onClick={() => setDeleteTarget({ id: i.id, name: i.name, type: 'institution' })}
                        className="p-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Institution"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg mt-4">{i.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {i.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )
      )}


      {/* Add / Edit Mess Modal */}
      {(showAddMess || editingMess) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 sticky top-0 bg-white z-10">
              <h3 className="text-base font-bold text-slate-900">
                {editingMess ? `Edit Mess (${editingMess.name})` : 'Add Mess Dining Block'}
              </h3>
              <button 
                type="button"
                onClick={() => {
                  setShowAddMess(false);
                  setEditingMess(null);
                  setMessName('');
                  setMessLocation('');
                }} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={editingMess ? handleUpdateMess : handleCreateMess} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Mess Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Campus Mess 3"
                  value={messName}
                  onChange={(e) => setMessName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Campus Location <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ground Floor, Hostel C Annexe"
                  value={messLocation}
                  onChange={(e) => setMessLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Dining Capacity</label>
                <input
                  type="number"
                  min={50}
                  max={2500}
                  value={messCapacity}
                  onChange={(e) => setMessCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMess(false);
                    setEditingMess(null);
                    setMessName('');
                    setMessLocation('');
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:bg-emerald-800 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingMess ? 'Update Mess' : 'Save Mess'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Hostel Modal */}
      {showAddHostel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 sticky top-0 bg-white z-10">
              <h3 className="text-base font-bold text-slate-900">Add Hostel Hall</h3>
              <button 
                type="button"
                onClick={() => setShowAddHostel(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateHostel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Hostel Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. APJ Abdul Kalam Hall"
                  value={hostelName}
                  onChange={(e) => setHostelName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Block / Wing Details</label>
                <input
                  type="text"
                  placeholder="e.g. Block C (Boys)"
                  value={hostelBlock}
                  onChange={(e) => setHostelBlock(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddHostel(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:bg-emerald-800 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Hostel</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Institution Modal */}
      {showAddInst && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 sticky top-0 bg-white z-10">
              <h3 className="text-base font-bold text-slate-900">Add Educational Institution</h3>
              <button 
                type="button"
                onClick={() => setShowAddInst(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateInstitution} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Institution Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Institute of Technology"
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Institution Code <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NIT-CAMPUS"
                  value={instCode}
                  onChange={(e) => setInstCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Campus City / Location <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore, Karnataka"
                  value={instLocation}
                  onChange={(e) => setInstLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddInst(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:bg-emerald-800 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Institution</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title={`Delete ${deleteTarget?.type ? deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1) : 'Item'}`}
        itemName={deleteTarget ? `${deleteTarget.name} (${deleteTarget.id})` : ''}
        itemType={deleteTarget?.type || 'item'}
        warningText={`Are you sure you want to permanently delete this ${deleteTarget?.type}? Any linked student assignments or food incharge relationships may need to be updated. This cannot be undone.`}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

