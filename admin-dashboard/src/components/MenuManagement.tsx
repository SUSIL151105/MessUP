import React, { useState, useMemo } from 'react';
import type { MenuEntry, DishItem, MealType, Mess } from '../types/models';
import { BackendService } from '../services/backend';
import { useAuth } from '../context/AuthContext';
import { 
  Utensils, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Sparkles,
  AlertCircle,
  X,
  ChevronUp,
  ChevronDown,
  Check,
  RotateCcw,
  Egg,
  Leaf,
  Layers,
  Clock
} from 'lucide-react';
import { 
  getDefaultDishesForMeal, 
  getLocalDateString, 
  getTomorrowDateString 
} from '../utils/menuUtils';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface MenuManagementProps {
  menus: MenuEntry[];
  messes: Mess[];
  onRefresh: () => void;
}

const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];

export const MenuManagement: React.FC<MenuManagementProps> = ({
  menus,
  messes,
  onRefresh
}) => {
  const { adminProfile } = useAuth();
  const [selectedMessId, setSelectedMessId] = useState<string>(messes[0]?.id || 'MESS_001');
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());

  // Keep selectedMessId in sync if messes load asynchronously
  React.useEffect(() => {
    if (messes.length > 0 && (!selectedMessId || !messes.some(m => m.id === selectedMessId))) {
      setSelectedMessId(messes[0].id);
    }
  }, [messes, selectedMessId]);

  // 7-Day Quick Dates Tab Row
  const weekDates = useMemo(() => {
    const list: { dateStr: string; labelStr: string; subLabel: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = getLocalDateString(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const labelStr = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayName;
      list.push({ dateStr, labelStr, subLabel: monthDay });
    }
    return list;
  }, []);

  // Editor Modal State
  const [editingMenu, setEditingMenu] = useState<MenuEntry | null>(null);
  const [dishes, setDishes] = useState<DishItem[]>([]);
  const [isCancelledMeal, setIsCancelledMeal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  // Dish Form inside Modal
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [dishName, setDishName] = useState('');
  const [dishDesc, setDishDesc] = useState('');
  const [dishIsVeg, setDishIsVeg] = useState(true);
  const [dishContainsEgg, setDishContainsEgg] = useState(false);
  const [dishIsAvailable, setDishIsAvailable] = useState(true);

  // Delete Menu Confirmation
  const [menuToDelete, setMenuToDelete] = useState<MenuEntry | null>(null);
  const [isDeletingMenu, setIsDeletingMenu] = useState(false);

  // Filtered menus for active mess & date
  const activeMessId = selectedMessId || messes[0]?.id || 'MESS_001';
  const filteredMenus = menus.filter(
    (m) => (m.messId === activeMessId || !m.messId) && m.date === selectedDate
  );

  const handleOpenCreateOrEdit = (mealType: MealType, existing?: MenuEntry) => {
    setEditingDishId(null);
    setDishName('');
    setDishDesc('');
    setDishIsVeg(true);
    setDishContainsEgg(false);
    setDishIsAvailable(true);

    if (existing) {
      setEditingMenu(existing);
      setDishes([...existing.dishes]);
      setIsCancelledMeal(existing.isCancelled || false);
      setCancellationReason(existing.cancellationReason || '');
    } else {
      const canonicalId = `${activeMessId}_${selectedDate}_${mealType}`;
      setEditingMenu({
        id: canonicalId,
        messId: activeMessId,
        date: selectedDate,
        mealType: mealType,
        dishes: [],
        isPublished: true,
        isCancelled: false,
        updatedAt: Date.now(),
        updatedBy: adminProfile?.uid || 'ADMIN'
      });
      setDishes([]);
      setIsCancelledMeal(false);
      setCancellationReason('');
    }
  };

  const handleStartEditDish = (dish: DishItem) => {
    setEditingDishId(dish.id);
    setDishName(dish.name);
    setDishDesc(dish.description || '');
    setDishIsVeg(dish.isVeg);
    setDishContainsEgg(dish.containsEgg || false);
    setDishIsAvailable(dish.isAvailable !== false);
  };

  const handleCancelEditDish = () => {
    setEditingDishId(null);
    setDishName('');
    setDishDesc('');
    setDishIsVeg(true);
    setDishContainsEgg(false);
    setDishIsAvailable(true);
  };

  const handleSaveDishItem = () => {
    if (!dishName.trim()) return;

    if (editingDishId) {
      // Update existing dish
      setDishes(
        dishes.map((d) =>
          d.id === editingDishId
            ? {
                ...d,
                name: dishName.trim(),
                description: dishDesc.trim(),
                isVeg: dishIsVeg,
                isNonVeg: !dishIsVeg,
                containsEgg: dishContainsEgg,
                isAvailable: dishIsAvailable
              }
            : d
        )
      );
    } else {
      // Add new dish
      const newDish: DishItem = {
        id: 'DISH_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name: dishName.trim(),
        description: dishDesc.trim(),
        isVeg: dishIsVeg,
        isNonVeg: !dishIsVeg,
        containsEgg: dishContainsEgg,
        isAvailable: dishIsAvailable
      };
      setDishes([...dishes, newDish]);
    }

    handleCancelEditDish();
  };

  const handleRemoveDish = (dishId: string) => {
    setDishes(dishes.filter((d) => d.id !== dishId));
    if (editingDishId === dishId) {
      handleCancelEditDish();
    }
  };

  const handleToggleDishInModal = (dishId: string) => {
    setDishes(
      dishes.map((d) => (d.id === dishId ? { ...d, isAvailable: !d.isAvailable } : d))
    );
  };

  const handleMoveDish = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= dishes.length) return;
    const reordered = [...dishes];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setDishes(reordered);
  };

  const handleLoadDefaultsInModal = () => {
    if (!editingMenu) return;
    const standard = getDefaultDishesForMeal(editingMenu.date, editingMenu.mealType);
    setDishes(standard);
  };

  const handleSaveMenu = async () => {
    if (!editingMenu || !adminProfile) return;
    try {
      const canonicalId = `${activeMessId}_${editingMenu.date}_${editingMenu.mealType}`;
      const payload: MenuEntry = {
        ...editingMenu,
        id: canonicalId,
        messId: activeMessId,
        dishes,
        isPublished: true,
        isCancelled: isCancelledMeal,
        cancellationReason: isCancelledMeal ? cancellationReason.trim() : undefined,
        updatedAt: Date.now(),
        updatedBy: adminProfile.uid
      };
      await BackendService.saveMenu(payload, adminProfile.uid);
      setEditingMenu(null);
      onRefresh();
    } catch (e) {
      alert('Failed to save menu schedule.');
    }
  };

  // Direct live toggle of dish availability from dashboard card
  const handleToggleDishAvailability = async (menu: MenuEntry, dishId: string) => {
    if (!adminProfile) return;
    try {
      await BackendService.toggleDishAvailability(menu.id, dishId, adminProfile.uid);
      onRefresh();
    } catch (e) {
      console.error('Error toggling dish availability:', e);
    }
  };

  // Quick load defaults for unscheduled meal
  const handleQuickLoadDefault = async (mealType: MealType) => {
    if (!adminProfile) return;
    try {
      const canonicalId = `${activeMessId}_${selectedDate}_${mealType}`;
      const defaultDishes = getDefaultDishesForMeal(selectedDate, mealType);
      const payload: MenuEntry = {
        id: canonicalId,
        messId: activeMessId,
        date: selectedDate,
        mealType: mealType,
        dishes: defaultDishes,
        isPublished: true,
        isCancelled: false,
        updatedAt: Date.now(),
        updatedBy: adminProfile.uid
      };
      await BackendService.saveMenu(payload, adminProfile.uid);
      onRefresh();
    } catch (e) {
      alert('Failed to publish default menu.');
    }
  };

  // Pre-fill all 4 meals for the active day
  const handlePreFillEntireDay = async () => {
    if (!adminProfile) return;
    if (!window.confirm(`Populate all 4 meal slots for ${selectedDate} with standard campus dishes?`)) return;
    try {
      for (const mealType of MEAL_TYPES) {
        const canonicalId = `${activeMessId}_${selectedDate}_${mealType}`;
        const defaultDishes = getDefaultDishesForMeal(selectedDate, mealType);
        const payload: MenuEntry = {
          id: canonicalId,
          messId: activeMessId,
          date: selectedDate,
          mealType: mealType,
          dishes: defaultDishes,
          isPublished: true,
          isCancelled: false,
          updatedAt: Date.now(),
          updatedBy: adminProfile.uid
        };
        await BackendService.saveMenu(payload, adminProfile.uid);
      }
      onRefresh();
    } catch (e) {
      alert('Failed to pre-fill day menu.');
    }
  };

  // Toggle cancellation of a meal session directly
  const handleToggleCancelMeal = async (menu: MenuEntry) => {
    if (!adminProfile) return;
    const newCancelState = !menu.isCancelled;
    let reason = menu.cancellationReason;
    if (newCancelState) {
      const promptReason = prompt('Enter cancellation notice for students (e.g., Kitchen maintenance, Festival holiday):');
      if (promptReason === null) return;
      reason = promptReason || 'Meal service suspended';
    }

    try {
      const updated: MenuEntry = {
        ...menu,
        isCancelled: newCancelState,
        cancellationReason: newCancelState ? reason : undefined,
        updatedAt: Date.now(),
        updatedBy: adminProfile.uid
      };
      await BackendService.saveMenu(updated, adminProfile.uid);
      onRefresh();
    } catch (e) {
      alert('Failed to update meal status.');
    }
  };

  // Confirm delete menu
  const handleConfirmDeleteMenu = async () => {
    if (!menuToDelete || !adminProfile) return;
    setIsDeletingMenu(true);
    try {
      await BackendService.deleteMenu(menuToDelete.id, adminProfile.uid);
      setMenuToDelete(null);
      onRefresh();
    } catch (e) {
      alert('Failed to delete menu schedule.');
    } finally {
      setIsDeletingMenu(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 7-Day Calendar Tab Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {weekDates.map((item) => {
            const isSelected = selectedDate === item.dateStr;
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDate(item.dateStr)}
                className={`px-4 py-2 rounded-xl text-left transition-all cursor-pointer flex flex-col items-center min-w-[95px] ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                }`}
              >
                <span className="text-xs">{item.labelStr}</span>
                <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {item.subLabel}
                </span>
              </button>
            );
          })}

          <div className="h-8 w-px bg-slate-200 mx-2" />

          {/* Custom Date Input */}
          <div className="flex items-center gap-2 pl-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Selector & Actions Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Mess Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Select Dining Mess
            </label>
            <select
              value={selectedMessId}
              onChange={(e) => setSelectedMessId(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              {messes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.location ? `(${m.location})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePreFillEntireDay}
            className="mt-4 px-3.5 py-2 bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Populate all four meals with campus standard recipes"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pre-fill Full Day Defaults</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2 bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-200/60">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-slate-700">Real-time bi-directional sync active</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">(Android App ⇄ Web Admin)</span>
        </div>
      </div>

      {/* 4 Meal Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MEAL_TYPES.map((type) => {
          const entry = filteredMenus.find((m) => m.mealType === type);
          const timeSlot =
            type === 'BREAKFAST'
              ? '07:30 AM - 09:30 AM'
              : type === 'LUNCH'
              ? '12:30 PM - 02:30 PM'
              : type === 'SNACKS'
              ? '05:00 PM - 06:00 PM'
              : '07:30 PM - 09:30 PM';

          return (
            <div
              key={type}
              className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col justify-between transition-all ${
                entry?.isCancelled
                  ? 'border-rose-200 bg-rose-50/10'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        type === 'BREAKFAST'
                          ? 'bg-amber-100 text-amber-800'
                          : type === 'LUNCH'
                          ? 'bg-emerald-100 text-emerald-800'
                          : type === 'SNACKS'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-violet-100 text-violet-800'
                      }`}
                    >
                      <Utensils className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm tracking-wide">{type}</h3>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{timeSlot}</span>
                      </div>
                    </div>
                  </div>

                  {entry ? (
                    entry.isCancelled ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        CANCELLED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        PUBLISHED ({entry.dishes.length} items)
                      </span>
                    )
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                      UNSCHEDULED
                    </span>
                  )}
                </div>

                {/* Cancellation notice */}
                {entry?.isCancelled && (
                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold">Cancellation Notice:</strong>{' '}
                      {entry.cancellationReason || 'Meal suspended by campus management'}
                    </div>
                  </div>
                )}

                {/* Dishes list */}
                <div className="py-4 space-y-2 min-h-[140px]">
                  {!entry || entry.dishes.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                      <Layers className="w-7 h-7 text-slate-300 stroke-[1.5]" />
                      <p>No dishes scheduled for this meal slot yet.</p>
                      <button
                        onClick={() => handleQuickLoadDefault(type)}
                        className="mt-1 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        + Load Campus Default ({type})
                      </button>
                    </div>
                  ) : (
                    entry.dishes.map((dish) => (
                      <div
                        key={dish.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                          dish.isAvailable
                            ? 'bg-slate-50 border-slate-200/70'
                            : 'bg-slate-100/70 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span className="text-xs" title={dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}>
                            {dish.isVeg ? '🟢' : '🔴'}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`font-semibold text-slate-800 ${
                                  !dish.isAvailable ? 'line-through text-slate-500' : ''
                                }`}
                              >
                                {dish.name}
                              </span>
                              {dish.containsEgg && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium">
                                  Egg
                                </span>
                              )}
                            </div>
                            {dish.description && (
                              <p className="text-[11px] text-slate-500 truncate">{dish.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Real-time Availability Switch pill */}
                        <button
                          type="button"
                          onClick={() => handleToggleDishAvailability(entry, dish.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex-shrink-0 transition-colors cursor-pointer border ${
                            dish.isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                          title="Click to toggle availability in student app"
                        >
                          {dish.isAvailable ? 'Available' : 'Sold Out'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenCreateOrEdit(type, entry)}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/80 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{entry ? 'Edit Menu Dishes' : 'Schedule Menu'}</span>
                  </button>

                  {entry && (
                    <button
                      onClick={() => handleToggleCancelMeal(entry)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                        entry.isCancelled
                          ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                      }`}
                    >
                      {entry.isCancelled ? 'Resume Meal' : 'Cancel Meal'}
                    </button>
                  )}
                </div>

                {entry && (
                  <button
                    onClick={() => setMenuToDelete(entry)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Menu Schedule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rich Menu Editor Modal */}
      {editingMenu && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/60">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Edit {editingMenu.mealType} Menu
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {editingMenu.date}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mess: {editingMenu.messId} • Real-time Android App Sync
                </p>
              </div>
              <button
                onClick={() => setEditingMenu(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Pre-fill Banner */}
              <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs">
                <div className="flex items-center gap-2 text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Load standard campus dishes for this slot:</span>
                </div>
                <button
                  type="button"
                  onClick={handleLoadDefaultsInModal}
                  className="px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-800 font-bold text-[11px] hover:bg-emerald-50 cursor-pointer shadow-xs"
                >
                  Load Defaults
                </button>
              </div>

              {/* Current dishes list */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Dishes in this Meal ({dishes.length})
                </label>
                {dishes.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/40">
                    No dishes added yet. Use the form below or load campus defaults.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {dishes.map((dish, idx) => (
                      <div
                        key={dish.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                          editingDishId === dish.id
                            ? 'bg-emerald-50/60 border-emerald-300'
                            : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          {/* Reorder controls */}
                          <div className="flex flex-col">
                            <button
                              type="button"
                              onClick={() => handleMoveDish(idx, 'up')}
                              disabled={idx === 0}
                              className="text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                              title="Move up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveDish(idx, 'down')}
                              disabled={idx === dishes.length - 1}
                              className="text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                              title="Move down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span>{dish.isVeg ? '🟢' : '🔴'}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-900">{dish.name}</span>
                              {dish.containsEgg && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded">Egg</span>
                              )}
                              {!dish.isAvailable && (
                                <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-medium">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                            {dish.description && (
                              <p className="text-[11px] text-slate-500 truncate">{dish.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Dish Row Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleDishInModal(dish.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${
                              dish.isAvailable
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            {dish.isAvailable ? 'In Stock' : 'Out'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEditDish(dish)}
                            className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                            title="Edit dish"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveDish(dish.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                            title="Remove dish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dish Edit / Add Form */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {editingDishId ? 'Edit Dish Details' : 'Add New Dish Item'}
                  </span>
                  {editingDishId && (
                    <button
                      type="button"
                      onClick={handleCancelEditDish}
                      className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dish Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Paneer Butter Masala, Sambar Vada"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description / Ingredients</label>
                  <input
                    type="text"
                    placeholder="e.g. Creamy cottage cheese in tomato cashew gravy"
                    value={dishDesc}
                    onChange={(e) => setDishDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 text-slate-700"
                  />
                </div>

                {/* Dietary options */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dishIsVeg}
                        onChange={(e) => setDishIsVeg(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Vegetarian (Veg)</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dishContainsEgg}
                        onChange={(e) => setDishContainsEgg(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Contains Egg</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dishIsAvailable}
                        onChange={(e) => setDishIsAvailable(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Available Now</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveDishItem}
                    disabled={!dishName.trim()}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors shadow-xs"
                  >
                    {editingDishId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Update Dish</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Dish</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Meal Cancellation Option */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCancelledMeal}
                    onChange={(e) => setIsCancelledMeal(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Mark This Entire Meal as Cancelled / Suspended</span>
                </label>

                {isCancelledMeal && (
                  <div>
                    <input
                      type="text"
                      placeholder="Reason for cancellation (e.g., Central Kitchen Maintenance)"
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
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
                onClick={() => setEditingMenu(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMenu}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Publish to Backend & Sync</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Menu Confirmation Modal */}
      {menuToDelete && (
        <DeleteConfirmModal
          isOpen={true}
          title={`Delete ${menuToDelete.mealType} Menu?`}
          itemName={`${menuToDelete.mealType} on ${menuToDelete.date}`}
          itemType="menu"
          warningText="This will remove the scheduled menu from the system. Students will see the fallback campus default menu."
          isDeleting={isDeletingMenu}
          onConfirm={handleConfirmDeleteMenu}
          onCancel={() => setMenuToDelete(null)}
        />
      )}
    </div>
  );
};
