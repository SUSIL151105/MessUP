import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  ref, 
  onValue, 
  set as setRtdb, 
  get as getRtdb, 
  update as updateRtdb, 
  remove as removeRtdb 
} from 'firebase/database';
import { db, rtdb } from './firebase';
import type { 
  UserProfile, 
  Institution, 
  Hostel, 
  Mess, 
  MenuEntry, 
  MealRating, 
  FeedbackComplaint, 
  Announcement, 
  AuditLog
} from '../types/models';
import { EmailNotificationService, type EmailDispatchRecord } from './emailService';

// Official Campus Infrastructure for Centurion University of Technology and Management (CUTM)
export const OFFICIAL_CAMPUS_FACILITIES = {
  institutions: [
    {
      id: 'INST_CUTM_001',
      name: 'Centurion University of Technology and Management (CUTM)',
      code: 'CUTM-BBSR',
      location: 'Bhubaneswar Campus, Ramachandrapur, Jatni, Odisha 752050',
      createdAt: 1700000000000
    }
  ] as Institution[],
  hostels: [
    {
      id: 'HOSTEL_GANGA',
      name: 'Ganga Boys Hostel',
      block: 'Wing A & B',
      institutionId: 'INST_CUTM_001',
      capacity: 450
    },
    {
      id: 'HOSTEL_GODAVARI',
      name: 'Godavari Boys Hostel',
      block: 'East Wing',
      institutionId: 'INST_CUTM_001',
      capacity: 400
    },
    {
      id: 'HOSTEL_KAVERI',
      name: 'Kaveri Girls Hostel',
      block: 'Block 1 & 2',
      institutionId: 'INST_CUTM_001',
      capacity: 500
    },
    {
      id: 'HOSTEL_MAHANADI',
      name: 'Mahanadi International Hostel',
      block: 'North Block',
      institutionId: 'INST_CUTM_001',
      capacity: 350
    }
  ] as Hostel[],
  messes: [
    {
      id: 'MESS_001',
      name: 'Central Campus Dining Hall',
      location: 'Near Student Activity Centre',
      institutionId: 'INST_CUTM_001',
      capacity: 600,
      inchargeUid: 'INCHARGE_RAJESH_KUMAR',
      inchargeName: 'Chef Rajesh Kumar'
    },
    {
      id: 'MESS_002',
      name: 'South Campus Mess (Ganga-Godavari)',
      location: 'Opposite Hostel Wing B',
      institutionId: 'INST_CUTM_001',
      capacity: 450,
      inchargeUid: 'INCHARGE_AMIT_PATNAIK',
      inchargeName: 'Chef Amit Patnaik'
    },
    {
      id: 'MESS_003',
      name: 'North Campus Mess (Kaveri Hall)',
      location: 'Adjacent to Kaveri Block',
      institutionId: 'INST_CUTM_001',
      capacity: 500,
      inchargeUid: '',
      inchargeName: ''
    },
    {
      id: 'MESS_004',
      name: 'International Hostel Dining',
      location: 'Mahanadi International Wing',
      institutionId: 'INST_CUTM_001',
      capacity: 350,
      inchargeUid: '',
      inchargeName: ''
    }
  ] as Mess[]
};

// Official CUTM Campus Users Directory (Students & Food Incharges)
export const OFFICIAL_CAMPUS_USERS: UserProfile[] = [
  {
    uid: 'STUDENT_SUSIL_MOHARANA',
    name: 'Susil Moharana',
    email: 'susilmoharana621@gmail.com',
    phone: '7008028135',
    role: 'STUDENT',
    institutionId: 'INST_CUTM_001',
    institutionName: 'Centurion University of Technology and Management (CUTM)',
    hostelId: 'HOSTEL_GANGA',
    hostelName: 'Ganga Boys Hostel',
    messId: 'MESS_001',
    messName: 'Central Campus Dining Hall',
    isApproved: true,
    isSuspended: false,
    createdAt: 1700000000000
  },
  {
    uid: 'STU_360822869',
    name: 'Susil Moharana',
    email: 'susilmoharana621@gmail.com',
    phone: '7008028135',
    role: 'STUDENT',
    institutionId: 'INST_CUTM_001',
    institutionName: 'Centurion University of Technology and Management (CUTM)',
    hostelId: 'HOSTEL_GANGA',
    hostelName: 'Ganga Boys Hostel',
    messId: 'MESS_001',
    messName: 'Central Campus Dining Hall',
    isApproved: true,
    isSuspended: false,
    createdAt: 1700000000000
  },
  {
    uid: 'STUDENT_PRIYA_SHARMA',
    name: 'Priya Sharma',
    email: 'priya.sharma@cutm.ac.in',
    phone: '+91 9876543221',
    role: 'STUDENT',
    institutionId: 'INST_CUTM_001',
    institutionName: 'Centurion University of Technology and Management (CUTM)',
    hostelId: 'HOSTEL_KAVERI',
    hostelName: 'Kaveri Girls Hostel',
    messId: 'MESS_001',
    messName: 'Central Campus Dining Hall',
    isApproved: true,
    isSuspended: false,
    createdAt: 1700000000000
  },
  {
    uid: 'STUDENT_RAHUL_VERMA',
    name: 'Rahul Verma',
    email: 'rahul.verma@cutm.ac.in',
    phone: '+91 9876543222',
    role: 'STUDENT',
    institutionId: 'INST_CUTM_001',
    institutionName: 'Centurion University of Technology and Management (CUTM)',
    hostelId: 'HOSTEL_GODAVARI',
    hostelName: 'Godavari Boys Hostel',
    messId: 'MESS_001',
    messName: 'Central Campus Dining Hall',
    isApproved: true,
    isSuspended: false,
    createdAt: 1700000000000
  },
  {
    uid: 'INCHARGE_RAJESH_KUMAR',
    name: 'Chef Rajesh Kumar',
    email: 'rajesh.kumar@cutm.ac.in',
    phone: '+91 9876543210',
    role: 'FOOD_INCHARGE',
    institutionId: 'INST_CUTM_001',
    institutionName: 'Centurion University of Technology and Management (CUTM)',
    messId: 'MESS_001',
    messName: 'Central Campus Dining Hall',
    isApproved: true,
    isSuspended: false,
    createdAt: 1700000000000
  },
  {
    uid: 'INCHARGE_AMIT_PATNAIK',
    name: 'Chef Amit Patnaik',
    email: 'amit.patnaik@cutm.ac.in',
    phone: '+91 9876543211',
    role: 'FOOD_INCHARGE',
    institutionId: 'INST_CUTM_001',
    institutionName: 'Centurion University of Technology and Management (CUTM)',
    messId: 'MESS_002',
    messName: 'South Campus Mess (Ganga-Godavari)',
    isApproved: true,
    isSuspended: false,
    createdAt: 1700000000000
  }
];

// Active Campus Grievance Reports (Live Synced with Mobile App)
export const CAMPUS_COMPLAINTS: FeedbackComplaint[] = [
  {
    id: 'COMP_AD74BD',
    studentId: 'STU_360822869',
    studentName: 'Susil Moharana',
    messId: 'MESS_001',
    category: 'TIMINGS',
    mealType: 'BREAKFAST',
    date: '2026-11-08',
    description: 'breakfast serving delayed',
    isPrivate: false,
    status: 'SUBMITTED',
    createdAt: 1794116323522,
    latitude: 20.1343783,
    longitude: 85.9207119,
    gpsLocationTag: '📍 LocLens™ GPS: 20.13438° N, 85.92071° E (Accuracy: ±100m) • Badapada Road, Rajas, Odisha'
  },
  {
    id: 'COMP_3E583C',
    studentId: 'STU_360822869',
    studentName: 'Susil Moharana',
    messId: 'MESS_001',
    category: 'FOOD_QUALITY',
    mealType: 'LUNCH',
    date: '2026-11-08',
    description: 'rotten eggs are served . and its kind of smelling',
    isPrivate: false,
    status: 'SUBMITTED',
    createdAt: 1794111599547,
    latitude: 18.80520,
    longitude: 84.14020,
    gpsLocationTag: '📍 LocLens™ GPS: 18.80520° N, 84.14020° E (Accuracy: ±2.4m) • CUTM Main Dining Hall, Paralakhemundi'
  }
];

// Ensure official campus infrastructure and users are populated in local storage if empty
if (typeof window !== 'undefined') {
  try {
    const existingMesses = localStorage.getItem('messup_messes');
    if (!existingMesses || existingMesses === '[]' || existingMesses === 'null') {
      localStorage.setItem('messup_institutions', JSON.stringify(OFFICIAL_CAMPUS_FACILITIES.institutions));
      localStorage.setItem('messup_hostels', JSON.stringify(OFFICIAL_CAMPUS_FACILITIES.hostels));
      localStorage.setItem('messup_messes', JSON.stringify(OFFICIAL_CAMPUS_FACILITIES.messes));
    }
    const existingUsers = localStorage.getItem('messup_users');
    if (!existingUsers || existingUsers === '[]' || existingUsers === 'null') {
      localStorage.setItem('messup_users', JSON.stringify(OFFICIAL_CAMPUS_USERS));
    }
    const existingComplaints = localStorage.getItem('messup_complaints');
    if (existingComplaints) {
      try {
        const parsed: any[] = JSON.parse(existingComplaints);
        // If any cached complaint is missing its photoUrl, purge the stale cache so fresh RTDB data with photos is loaded
        const isStale = parsed.some(c => !c.photoUrl);
        if (isStale) {
          localStorage.removeItem('messup_complaints');
        } else {
          const filtered = parsed.filter(c => 
            !c.id?.startsWith('COMP_HYG_') && 
            !c.id?.startsWith('COMP_TIM_') && 
            !c.id?.startsWith('COMP_POR_') && 
            !c.id?.startsWith('COMP_SER_') && 
            !c.id?.startsWith('COMP_MEN_')
          );
          localStorage.setItem('messup_complaints', JSON.stringify(filtered));
        }
      } catch {}
    }

    // Always clear old cached ratings so authoritative live RTDB meal ratings are loaded without proxy duplicates
    localStorage.removeItem('messup_ratings');
  } catch {}
}

// Deleted items blacklist tracking so deleted items stay deleted across reloads and syncs
const getDeletedIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem('messup_deleted_ids');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const markAsDeleted = (id: string) => {
  if (!id) return;
  const deleted = getDeletedIds();
  deleted.add(id);
  localStorage.setItem('messup_deleted_ids', JSON.stringify(Array.from(deleted)));
};

// Local storage cache helper with resilient facility and user directory defaults
const getLocalOrSeed = <T extends { id?: string; uid?: string }>(key: string, defaultData: T[] = []): T[] => {
  const deletedIds = getDeletedIds();
  const item = localStorage.getItem(`messup_${key}`);
  let list: T[] = [];
  if (item) {
    try {
      list = JSON.parse(item);
    } catch {
      list = defaultData;
    }
  } else {
    list = defaultData;
  }

  // If list is empty and official defaults are available, populate with campus defaults
  if (!list || list.length === 0) {
    if (key === 'institutions') {
      list = OFFICIAL_CAMPUS_FACILITIES.institutions as unknown as T[];
    } else if (key === 'hostels') {
      list = OFFICIAL_CAMPUS_FACILITIES.hostels as unknown as T[];
    } else if (key === 'messes') {
      list = OFFICIAL_CAMPUS_FACILITIES.messes as unknown as T[];
    } else if (key === 'users') {
      list = OFFICIAL_CAMPUS_USERS as unknown as T[];
    } else if (key === 'complaints') {
      list = CAMPUS_COMPLAINTS as unknown as T[];
    } else {
      list = defaultData;
    }
  }

  return list.filter(item => {
    const id = item.id || item.uid;
    return !id || !deletedIds.has(id);
  });
};

const setLocal = <T>(key: string, data: T[]) => {
  localStorage.setItem(`messup_${key}`, JSON.stringify(data));
};

// Deeply sanitize object so no undefined properties are sent to Firestore
export const sanitizeForFirestore = <T extends Record<string, any>>(obj: T): T => {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = sanitizeForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
};

// Network timeout helper to keep operations seamless even on sluggish networks
const withTimeout = <T>(promise: Promise<T>, ms: number = 3000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    )
  ]);
};

// Robust entity merger: combines existing local entities and incoming Firestore docs without wiping cache
function mergeEntities<T extends { id?: string; uid?: string }>(
  existingLocal: T[],
  firestoreItems: T[]
): T[] {
  const deletedIds = getDeletedIds();
  const map = new Map<string, T>();

  // 1. Overlay existing local items
  for (const item of existingLocal) {
    const key = item.id || item.uid;
    if (key && !deletedIds.has(key)) {
      map.set(key, item);
    }
  }

  // 2. Overlay Firestore items non-destructively
  for (const fItem of firestoreItems) {
    const key = fItem.id || fItem.uid;
    if (!key || deletedIds.has(key)) continue;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, fItem);
    } else {
      const merged: any = { ...existing };
      for (const [prop, val] of Object.entries(fItem)) {
        if (val !== undefined && val !== null && val !== '') {
          merged[prop] = val;
        }
      }
      map.set(key, merged);
    }
  }

  return Array.from(map.values());
}

// Canonical Menu Merger: guarantees zero collisions between mess, date, and meal slot,
// matching the Android app repository convention: ${messId}_${date}_${mealType}
function mergeMenus(
  existingLocal: MenuEntry[],
  firestoreItems: MenuEntry[]
): MenuEntry[] {
  const deletedIds = getDeletedIds();
  const map = new Map<string, MenuEntry>();

  const getCanonicalKey = (m: MenuEntry) => {
    if (m.messId && m.date && m.mealType) {
      return `${m.messId}_${m.date}_${m.mealType}`;
    }
    return m.id;
  };

  // 1. Local cache
  for (const item of existingLocal) {
    const key = getCanonicalKey(item);
    if (key && !deletedIds.has(key) && !deletedIds.has(item.id)) {
      map.set(key, { ...item, id: key });
    }
  }

  // 2. Firestore items (realtime remote sync - takes priority)
  for (const fItem of firestoreItems) {
    const key = getCanonicalKey(fItem);
    if (!key || deletedIds.has(key) || deletedIds.has(fItem.id)) continue;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...fItem, id: key });
    } else {
      map.set(key, { ...existing, ...fItem, id: key });
    }
  }

  return Array.from(map.values());
}

// Canonical Rating Merger: ensures all ratings sync seamlessly and sorts by newest review first
function mergeRatings(
  existingLocal: MealRating[],
  firestoreItems: MealRating[]
): MealRating[] {
  const deletedIds = getDeletedIds();
  // When RTDB items are available, they are the authoritative source of truth
  if (firestoreItems && firestoreItems.length > 0) {
    return firestoreItems
      .filter(item => item.id && !deletedIds.has(item.id))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  const map = new Map<string, MealRating>();
  for (const item of existingLocal) {
    if (item.id && !deletedIds.has(item.id)) {
      map.set(item.id, item);
    }
  }

  return Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

// User Profile Merger: accurately unites Firestore auth docs, email docs, and local profiles
function mergeAndDeduplicateUsers(
  existingLocal: UserProfile[],
  firestoreItems: UserProfile[]
): UserProfile[] {
  const deletedIds = getDeletedIds();
  const emailMap = new Map<string, UserProfile>();
  const uidMap = new Map<string, UserProfile>();

  const processUser = (u: UserProfile) => {
    const uid = u.uid?.trim() || '';
    const email = u.email?.trim().toLowerCase() || '';

    if (deletedIds.has(uid) || (email && deletedIds.has(email))) {
      return;
    }

    let existing = (email ? emailMap.get(email) : null) || (uid ? uidMap.get(uid) : null);

    if (!existing) {
      const copy = { ...u, email: email || u.email };
      if (email) emailMap.set(email, copy);
      if (uid) uidMap.set(uid, copy);
    } else {
      const preferAuthUid = (existing.uid.startsWith('STUDENT_') || existing.uid.startsWith('INCHARGE_')) &&
        !uid.startsWith('STUDENT_') && !uid.startsWith('INCHARGE_') && uid.length > 5;

      const mergedRole = (u.role === 'FOOD_INCHARGE' || existing.role === 'FOOD_INCHARGE') 
        ? 'FOOD_INCHARGE' 
        : (u.role === 'ADMIN' || existing.role === 'ADMIN' ? 'ADMIN' : (u.role || existing.role || 'STUDENT'));

      const merged: UserProfile = {
        uid: preferAuthUid ? uid : (existing.uid || uid),
        name: (u.name && !u.name.includes('@') && u.name.length > 2) ? u.name : (existing.name || u.name),
        email: email || existing.email,
        phone: (u.phone && u.phone.trim()) ? u.phone : (existing.phone || ''),
        role: mergedRole,
        institutionId: (u.institutionId && u.institutionId.trim()) ? u.institutionId : (existing.institutionId || ''),
        institutionName: (u.institutionName && u.institutionName.trim()) ? u.institutionName : (existing.institutionName || ''),
        hostelId: (u.hostelId && u.hostelId.trim()) ? u.hostelId : (existing.hostelId || ''),
        hostelName: (u.hostelName && u.hostelName.trim()) ? u.hostelName : (existing.hostelName || ''),
        messId: (u.messId && u.messId.trim()) ? u.messId : (existing.messId || ''),
        messName: (u.messName && u.messName.trim()) ? u.messName : (existing.messName || ''),
        isApproved: u.isApproved !== undefined ? (u.isApproved || existing.isApproved) : existing.isApproved,
        isSuspended: u.isSuspended !== undefined ? u.isSuspended : (existing.isSuspended || false),
        createdAt: existing.createdAt || u.createdAt || Date.now()
      };

      if (email) emailMap.set(email, merged);
      if (merged.uid) uidMap.set(merged.uid, merged);
    }
  };

  // 1. Process Local Cache
  for (const l of existingLocal) processUser(l);
  // 2. Process Firestore Snapshot Docs
  for (const f of firestoreItems) processUser(f);

  const result: UserProfile[] = [];
  const seen = new Set<string>();
  for (const u of emailMap.values()) {
    const key = u.email?.trim().toLowerCase() || u.uid;
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(u);
    }
  }
  for (const u of uidMap.values()) {
    const key = u.email?.trim().toLowerCase() || u.uid;
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(u);
    }
  }

  return result;
}

export function rtdbSnapshotToItems<T extends { id?: string; uid?: string }>(snapshot: any): T[] {
  if (!snapshot || !snapshot.exists()) return [];
  const val = snapshot.val();
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.filter(Boolean);
  }
  return Object.entries(val).map(([key, data]: [string, any]) => {
    if (typeof data === 'object' && data !== null) {
      return {
        id: data.id || key,
        uid: data.uid || key,
        ...data
      };
    }
    return { id: key, value: data } as any;
  });
}

export class BackendService {
  // --- AUDIT LOGGING ---
  static async logAction(
    action: string,
    entityType: string,
    entityId: string,
    performedBy: string,
    performedByName: string,
    details: string,
    beforeValue?: any,
    afterValue?: any
  ): Promise<void> {
    const log: AuditLog = {
      id: 'LOG_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      action,
      entityType,
      entityId,
      performedBy,
      performedByName,
      details,
      beforeValue: beforeValue ? JSON.stringify(beforeValue) : undefined,
      afterValue: afterValue ? JSON.stringify(afterValue) : undefined,
      timestamp: Date.now()
    };

    const currentLogs = getLocalOrSeed<AuditLog>('auditLogs', []);
    setLocal('auditLogs', [log, ...currentLogs]);

    withTimeout(setRtdb(ref(rtdb, `auditLogs/${log.id}`), sanitizeForFirestore(log)), 2500).catch(() => {});
    withTimeout(setDoc(doc(db, 'auditLogs', log.id), log), 2500).catch(() => {});
  }

  static subscribeAuditLogs(callback: (logs: AuditLog[]) => void): () => void {
    return onValue(ref(rtdb, 'auditLogs'), (snapshot) => {
      const items = rtdbSnapshotToItems<AuditLog>(snapshot)
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setLocal('auditLogs', items);
      callback(items);
    }, (e) => {
      console.warn('Real-time auditLogs notice:', e);
      callback(getLocalOrSeed<AuditLog>('auditLogs', []));
    });
  }

  static async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const snap = await withTimeout(getRtdb(ref(rtdb, 'auditLogs')), 3000);
      if (snap.exists()) {
        const items = rtdbSnapshotToItems<AuditLog>(snap)
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setLocal('auditLogs', items);
        return items;
      }
    } catch (e) {
      console.warn('RTDB read error auditLogs, using cached:', e);
    }
    return getLocalOrSeed<AuditLog>('auditLogs', []);
  }

  // --- INSTITUTIONS ---
  static subscribeInstitutions(callback: (insts: Institution[]) => void): () => void {
    return onValue(ref(rtdb, 'institutions'), (snapshot) => {
      const rtdbItems = rtdbSnapshotToItems<Institution>(snapshot);
      const localItems = getLocalOrSeed<Institution>('institutions', OFFICIAL_CAMPUS_FACILITIES.institutions);
      const merged = mergeEntities(localItems, rtdbItems);
      setLocal('institutions', merged);
      callback(merged);
    }, (e) => {
      console.warn('Real-time institutions notice (using local fallback):', e);
      callback(getLocalOrSeed<Institution>('institutions', OFFICIAL_CAMPUS_FACILITIES.institutions));
    });
  }

  static async getInstitutions(): Promise<Institution[]> {
    try {
      const snap = await withTimeout(getRtdb(ref(rtdb, 'institutions')), 3000);
      const rtdbItems = rtdbSnapshotToItems<Institution>(snap);
      const localItems = getLocalOrSeed<Institution>('institutions', OFFICIAL_CAMPUS_FACILITIES.institutions);
      const merged = mergeEntities(localItems, rtdbItems);
      setLocal('institutions', merged);
      return merged;
    } catch (e) {
      console.warn('RTDB institutions fallback:', e);
    }
    return getLocalOrSeed<Institution>('institutions', OFFICIAL_CAMPUS_FACILITIES.institutions);
  }

  static async initializeCampusFacilities(adminUid: string = 'admin'): Promise<void> {
    localStorage.removeItem('messup_deleted_ids');
    setLocal('institutions', OFFICIAL_CAMPUS_FACILITIES.institutions);
    setLocal('hostels', OFFICIAL_CAMPUS_FACILITIES.hostels);
    setLocal('messes', OFFICIAL_CAMPUS_FACILITIES.messes);
    setLocal('users', OFFICIAL_CAMPUS_USERS);

    for (const inst of OFFICIAL_CAMPUS_FACILITIES.institutions) {
      withTimeout(setRtdb(ref(rtdb, `institutions/${inst.id}`), sanitizeForFirestore(inst)), 3000).catch(() => {});
      withTimeout(setDoc(doc(db, 'institutions', inst.id), inst), 3000).catch(() => {});
    }
    for (const hostel of OFFICIAL_CAMPUS_FACILITIES.hostels) {
      withTimeout(setRtdb(ref(rtdb, `hostels/${hostel.id}`), sanitizeForFirestore(hostel)), 3000).catch(() => {});
      withTimeout(setDoc(doc(db, 'hostels', hostel.id), hostel), 3000).catch(() => {});
    }
    for (const mess of OFFICIAL_CAMPUS_FACILITIES.messes) {
      withTimeout(setRtdb(ref(rtdb, `messes/${mess.id}`), sanitizeForFirestore(mess)), 3000).catch(() => {});
      withTimeout(setDoc(doc(db, 'messes', mess.id), mess), 3000).catch(() => {});
    }
    for (const user of OFFICIAL_CAMPUS_USERS) {
      withTimeout(setRtdb(ref(rtdb, `users/${user.uid}`), sanitizeForFirestore(user)), 3000).catch(() => {});
      withTimeout(setDoc(doc(db, 'users', user.uid), user), 3000).catch(() => {});
      if (user.email) {
        const cleanEmailKey = user.email.replace(/[.#$[\]]/g, '_');
        withTimeout(setRtdb(ref(rtdb, `users/${cleanEmailKey}`), sanitizeForFirestore(user)), 3000).catch(() => {});
      }
    }

    this.logAction('INITIALIZE_CAMPUS', 'CAMPUS', 'CUTM', adminUid, 'Admin', 'Initialized Centurion University campus facilities and user directory').catch(() => {});
  }

  static async createInstitution(inst: Omit<Institution, 'id'>, adminUid: string): Promise<Institution> {
    const id = 'INST_' + Date.now();
    const newInst: Institution = { ...inst, id, createdAt: Date.now() };
    
    const list = getLocalOrSeed<Institution>('institutions', []);
    const updated = [newInst, ...list.filter(i => i.id !== id)];
    setLocal('institutions', updated);

    withTimeout(setRtdb(ref(rtdb, `institutions/${id}`), sanitizeForFirestore(newInst)), 4000).catch((e) => {
      console.warn('Create institution RTDB sync error:', e);
    });
    withTimeout(setDoc(doc(db, 'institutions', id), newInst), 4000).catch(() => {});

    this.logAction('CREATE_INSTITUTION', 'INSTITUTION', id, adminUid, 'Admin', `Created institution ${inst.name}`).catch(() => {});
    return newInst;
  }

  static async deleteInstitution(id: string, adminUid: string): Promise<void> {
    markAsDeleted(id);
    const list = getLocalOrSeed<Institution>('institutions', []);
    const existing = list.find(i => i.id === id);
    const updated = list.filter(i => i.id !== id);
    setLocal('institutions', updated);

    withTimeout(removeRtdb(ref(rtdb, `institutions/${id}`)), 4000).catch((e) => {
      console.warn('Delete institution RTDB sync error:', e);
    });
    withTimeout(deleteDoc(doc(db, 'institutions', id)), 4000).catch(() => {});

    this.logAction('DELETE_INSTITUTION', 'INSTITUTION', id, adminUid, 'Admin', `Deleted institution ${existing?.name || id}`).catch(() => {});
  }

  // --- HOSTELS ---
  static subscribeHostels(callback: (hostels: Hostel[]) => void): () => void {
    return onValue(ref(rtdb, 'hostels'), (snapshot) => {
      const rtdbItems = rtdbSnapshotToItems<Hostel>(snapshot);
      const localItems = getLocalOrSeed<Hostel>('hostels', OFFICIAL_CAMPUS_FACILITIES.hostels);
      const merged = mergeEntities(localItems, rtdbItems);
      setLocal('hostels', merged);
      callback(merged);
    }, (e) => {
      console.warn('Real-time hostels notice (using local fallback):', e);
      callback(getLocalOrSeed<Hostel>('hostels', OFFICIAL_CAMPUS_FACILITIES.hostels));
    });
  }

  static async getHostels(): Promise<Hostel[]> {
    try {
      const snap = await withTimeout(getRtdb(ref(rtdb, 'hostels')), 3000);
      const rtdbItems = rtdbSnapshotToItems<Hostel>(snap);
      const localItems = getLocalOrSeed<Hostel>('hostels', OFFICIAL_CAMPUS_FACILITIES.hostels);
      const merged = mergeEntities(localItems, rtdbItems);
      setLocal('hostels', merged);
      return merged;
    } catch (e) {
      console.warn('RTDB hostels fallback:', e);
    }
    return getLocalOrSeed<Hostel>('hostels', OFFICIAL_CAMPUS_FACILITIES.hostels);
  }

  static async createHostel(hostel: Omit<Hostel, 'id'>, adminUid: string): Promise<Hostel> {
    const id = 'HOSTEL_' + Date.now();
    const newHostel: Hostel = { ...hostel, id };
    
    const list = getLocalOrSeed<Hostel>('hostels', []);
    const updated = [newHostel, ...list.filter(h => h.id !== id)];
    setLocal('hostels', updated);

    withTimeout(setRtdb(ref(rtdb, `hostels/${id}`), sanitizeForFirestore(newHostel)), 4000).catch((e) => {
      console.warn('Create hostel RTDB sync error:', e);
    });
    withTimeout(setDoc(doc(db, 'hostels', id), newHostel), 4000).catch(() => {});

    this.logAction('CREATE_HOSTEL', 'HOSTEL', id, adminUid, 'Admin', `Created hostel ${hostel.name}`).catch(() => {});
    return newHostel;
  }

  static async deleteHostel(id: string, adminUid: string): Promise<void> {
    markAsDeleted(id);
    const list = getLocalOrSeed<Hostel>('hostels', []);
    const existing = list.find(h => h.id === id);
    const updated = list.filter(h => h.id !== id);
    setLocal('hostels', updated);

    withTimeout(removeRtdb(ref(rtdb, `hostels/${id}`)), 4000).catch((e) => {
      console.warn('Delete hostel RTDB sync error:', e);
    });
    withTimeout(deleteDoc(doc(db, 'hostels', id)), 4000).catch(() => {});

    this.logAction('DELETE_HOSTEL', 'HOSTEL', id, adminUid, 'Admin', `Deleted hostel ${existing?.name || id}`).catch(() => {});
  }

  // --- MESSES ---
  static subscribeMesses(callback: (messes: Mess[]) => void): () => void {
    return onValue(ref(rtdb, 'messes'), (snapshot) => {
      const rtdbItems = rtdbSnapshotToItems<Mess>(snapshot);
      const localItems = getLocalOrSeed<Mess>('messes', OFFICIAL_CAMPUS_FACILITIES.messes);
      const merged = mergeEntities(localItems, rtdbItems);
      setLocal('messes', merged);
      callback(merged);
    }, (e) => {
      console.warn('Real-time messes notice (using local fallback):', e);
      callback(getLocalOrSeed<Mess>('messes', OFFICIAL_CAMPUS_FACILITIES.messes));
    });
  }

  static async getMesses(): Promise<Mess[]> {
    try {
      const snap = await withTimeout(getRtdb(ref(rtdb, 'messes')), 3000);
      const rtdbItems = rtdbSnapshotToItems<Mess>(snap);
      const localItems = getLocalOrSeed<Mess>('messes', OFFICIAL_CAMPUS_FACILITIES.messes);
      const merged = mergeEntities(localItems, rtdbItems);
      setLocal('messes', merged);
      return merged;
    } catch (e) {
      console.warn('RTDB messes fallback:', e);
    }
    return getLocalOrSeed<Mess>('messes', OFFICIAL_CAMPUS_FACILITIES.messes);
  }

  static async createMess(mess: Omit<Mess, 'id'>, adminUid: string): Promise<Mess> {
    const id = 'MESS_' + Date.now();
    const newMess: Mess = { ...mess, id };

    const list = getLocalOrSeed<Mess>('messes', []);
    const updated = [newMess, ...list.filter(m => m.id !== id)];
    setLocal('messes', updated);

    withTimeout(setRtdb(ref(rtdb, `messes/${id}`), sanitizeForFirestore(newMess)), 4000).catch((e) => {
      console.warn('Create mess RTDB sync error:', e);
    });
    withTimeout(setDoc(doc(db, 'messes', id), newMess), 4000).catch(() => {});

    this.logAction('CREATE_MESS', 'MESS', id, adminUid, 'Admin', `Created mess ${mess.name}`).catch(() => {});
    return newMess;
  }

  static async updateMess(id: string, updates: Partial<Mess>, adminUid: string): Promise<void> {
    const list = getLocalOrSeed<Mess>('messes', []);
    const cleanUpdates = sanitizeForFirestore(updates);
    const updated = list.map(m => m.id === id ? { ...m, ...cleanUpdates } : m);
    setLocal('messes', updated);

    withTimeout(updateRtdb(ref(rtdb, `messes/${id}`), cleanUpdates), 4000).catch((e) => {
      console.warn('Update mess RTDB sync error:', e);
    });
    withTimeout(setDoc(doc(db, 'messes', id), cleanUpdates, { merge: true }), 4000).catch(() => {});

    this.logAction('UPDATE_MESS', 'MESS', id, adminUid, 'Admin', `Updated mess ${id}`).catch(() => {});
  }

  static async deleteMess(id: string, adminUid: string): Promise<void> {
    markAsDeleted(id);
    const list = getLocalOrSeed<Mess>('messes', []);
    const existing = list.find(m => m.id === id);
    const updated = list.filter(m => m.id !== id);
    setLocal('messes', updated);

    withTimeout(removeRtdb(ref(rtdb, `messes/${id}`)), 4000).catch((e) => {
      console.warn('Delete mess RTDB sync error:', e);
    });
    withTimeout(deleteDoc(doc(db, 'messes', id)), 4000).catch(() => {});

    this.logAction('DELETE_MESS', 'MESS', id, adminUid, 'Admin', `Deleted mess ${existing?.name || id}`).catch(() => {});
  }

  // --- USERS (STUDENTS & FOOD INCHARGES) ---
  static deduplicateUsers(rawList: UserProfile[]): UserProfile[] {
    return mergeAndDeduplicateUsers([], rawList);
  }

  static subscribeUsers(callback: (users: UserProfile[]) => void): () => void {
    return onValue(ref(rtdb, 'users'), (snapshot) => {
      const rtdbItems = rtdbSnapshotToItems<UserProfile>(snapshot);
      const localItems = getLocalOrSeed<UserProfile>('users', OFFICIAL_CAMPUS_USERS);
      const combined = mergeAndDeduplicateUsers(localItems, rtdbItems);
      setLocal('users', combined);
      callback(combined);
    }, (e) => {
      console.warn('Real-time users error (using cached):', e);
      callback(getLocalOrSeed<UserProfile>('users', OFFICIAL_CAMPUS_USERS));
    });
  }

  static async getUsers(): Promise<UserProfile[]> {
    try {
      const snap = await withTimeout(getRtdb(ref(rtdb, 'users')), 3000);
      const rtdbItems = rtdbSnapshotToItems<UserProfile>(snap);
      const localItems = getLocalOrSeed<UserProfile>('users', OFFICIAL_CAMPUS_USERS);
      const combined = mergeAndDeduplicateUsers(localItems, rtdbItems);
      setLocal('users', combined);
      return combined;
    } catch (e) {
      console.warn('RTDB users fallback:', e);
    }
    return mergeAndDeduplicateUsers(
      getLocalOrSeed<UserProfile>('users', OFFICIAL_CAMPUS_USERS),
      []
    );
  }

  static async updateUser(uid: string, updates: Partial<UserProfile>, adminUid: string): Promise<void> {
    const list = getLocalOrSeed<UserProfile>('users', []);
    const user = list.find(u => u.uid === uid || (u.email && updates.email && u.email.toLowerCase() === updates.email.toLowerCase()));
    const cleanUpdates = sanitizeForFirestore(updates);
    const targetEmail = (updates.email || user?.email)?.trim().toLowerCase();

    const updated = list.map(u => {
      if (u.uid === uid || (targetEmail && u.email && u.email.toLowerCase() === targetEmail)) {
        return { ...u, ...cleanUpdates };
      }
      return u;
    });
    setLocal('users', updated);

    // 1. Sync to primary RTDB node
    withTimeout(updateRtdb(ref(rtdb, `users/${uid}`), cleanUpdates), 4000).catch((e) => {
      console.warn('Update user RTDB sync error:', e);
    });

    // 2. Also write to email-indexed RTDB node for quick lookup
    if (targetEmail && targetEmail !== uid) {
      const emailKey = targetEmail.replace(/[.#$[\]]/g, '_');
      withTimeout(updateRtdb(ref(rtdb, `users/${emailKey}`), cleanUpdates), 4000).catch(() => {});
    }

    // 3. Fallback to Firestore
    withTimeout(setDoc(doc(db, 'users', uid), cleanUpdates, { merge: true }), 4000).catch(() => {});

    this.logAction('UPDATE_USER', 'USER', uid, adminUid, 'Admin', `Updated user ${user?.name || uid}`, user, cleanUpdates).catch(() => {});
  }

  static async editFoodIncharge(
    uid: string,
    data: {
      name: string;
      phone: string;
      institutionId: string;
      institutionName: string;
      messId: string;
      messName: string;
    },
    adminUid: string
  ): Promise<void> {
    const list = getLocalOrSeed<UserProfile>('users', []);
    const existing = list.find(u => u.uid === uid);
    const cleanEmail = existing?.email?.trim().toLowerCase();

    const updates: Partial<UserProfile> = {
      name: data.name,
      phone: data.phone,
      institutionId: data.institutionId || existing?.institutionId || '',
      institutionName: data.institutionName || existing?.institutionName || '',
      messId: data.messId,
      messName: data.messName
    };
    await this.updateUser(uid, updates, adminUid);

    if (cleanEmail && cleanEmail !== uid) {
      const emailKey = cleanEmail.replace(/[.#$[\]]/g, '_');
      withTimeout(updateRtdb(ref(rtdb, `users/${emailKey}`), sanitizeForFirestore(updates)), 4000).catch(() => {});
    }

    if (data.messId) {
      await this.updateMess(data.messId, { inchargeUid: uid, inchargeName: data.name }, adminUid);
    }
  }

  static async deleteUser(uid: string, adminUid: string): Promise<void> {
    markAsDeleted(uid);
    const list = getLocalOrSeed<UserProfile>('users', []);
    const existing = list.find(u => u.uid === uid);
    const cleanEmail = existing?.email?.trim().toLowerCase();
    if (cleanEmail) markAsDeleted(cleanEmail);

    const updated = list.filter(u => u.uid !== uid && (!cleanEmail || u.email?.trim().toLowerCase() !== cleanEmail));
    setLocal('users', updated);

    withTimeout(removeRtdb(ref(rtdb, `users/${uid}`)), 4000).catch((e) => {
      console.warn('Delete user RTDB sync error:', e);
    });
    if (cleanEmail && cleanEmail !== uid) {
      const emailKey = cleanEmail.replace(/[.#$[\]]/g, '_');
      withTimeout(removeRtdb(ref(rtdb, `users/${emailKey}`)), 4000).catch(() => {});
    }
    withTimeout(deleteDoc(doc(db, 'users', uid)), 4000).catch(() => {});

    this.logAction('DELETE_USER', 'USER', uid, adminUid, 'Admin', `Deleted user ${existing?.name || uid}`).catch(() => {});
  }

  static async registerStudent(
    data: {
      name: string;
      email: string;
      phone: string;
      institutionId: string;
      institutionName: string;
      hostelId: string;
      hostelName: string;
      messId: string;
      messName: string;
      adminEmail?: string;
    },
    adminUid: string
  ): Promise<{ student: UserProfile; emailDispatch: EmailDispatchRecord }> {
    const cleanEmail = data.email.trim().toLowerCase();
    const uid = 'STUDENT_' + Date.now();
    const student: UserProfile = {
      uid,
      name: data.name,
      email: cleanEmail,
      phone: data.phone || '',
      role: 'STUDENT',
      institutionId: data.institutionId || '',
      institutionName: data.institutionName || '',
      hostelId: data.hostelId || '',
      hostelName: data.hostelName || '',
      messId: data.messId || '',
      messName: data.messName || '',
      isApproved: true,
      createdAt: Date.now()
    };

    // Instant local state save
    const list = getLocalOrSeed<UserProfile>('users', []);
    setLocal('users', [...list.filter(u => u.email.toLowerCase() !== cleanEmail), student]);

    // RTDB sync
    const cleanStudent = sanitizeForFirestore(student);
    withTimeout(setRtdb(ref(rtdb, `users/${uid}`), cleanStudent), 4000).catch((e) => {
      console.warn('Create student RTDB sync error:', e);
    });
    const emailKey = cleanEmail.replace(/[.#$[\]]/g, '_');
    withTimeout(setRtdb(ref(rtdb, `users/${emailKey}`), cleanStudent), 4000).catch(() => {});

    // Fallback to Firestore
    withTimeout(setDoc(doc(db, 'users', uid), cleanStudent), 4000).catch(() => {});

    // Send automated personalized email with default password
    const senderEmail = data.adminEmail || 'admin@messup.campus';
    const emailDispatch = await EmailNotificationService.sendWelcomeEmail({
      recipientName: data.name,
      recipientEmail: data.email,
      role: 'STUDENT',
      temporaryPassword: 'Student@123',
      portalName: 'MessUP Student Dining Portal',
      assignedMess: student.messName,
      assignedHostel: student.hostelName,
      institutionName: student.institutionName,
      senderEmail,
      senderName: 'MessUP Campus Administration'
    });

    this.logAction(
      'REGISTER_STUDENT',
      'USER',
      uid,
      adminUid,
      'Admin',
      `Registered student ${data.name} (${data.email}) - Welcome email sent from ${senderEmail}`
    ).catch(() => {});

    return { student, emailDispatch };
  }

  static async createStudent(
    data: {
      name: string;
      email: string;
      phone?: string;
      institutionId?: string;
      institutionName?: string;
      hostelId?: string;
      hostelName?: string;
      messId?: string;
      messName?: string;
      adminEmail?: string;
    },
    adminUid: string
  ): Promise<{ student: UserProfile; emailDispatch: EmailDispatchRecord }> {
    return this.registerStudent(
      {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        institutionId: data.institutionId || '',
        institutionName: data.institutionName || '',
        hostelId: data.hostelId || '',
        hostelName: data.hostelName || '',
        messId: data.messId || '',
        messName: data.messName || '',
        adminEmail: data.adminEmail
      },
      adminUid
    );
  }

  static async provisionFoodIncharge(
    data: {
      name: string;
      email: string;
      phone: string;
      institutionId: string;
      institutionName: string;
      messId: string;
      messName: string;
      adminEmail?: string;
    },
    adminUid: string
  ): Promise<{ incharge: UserProfile; emailDispatch: EmailDispatchRecord }> {
    const cleanEmail = data.email.trim().toLowerCase();
    const uid = 'INCHARGE_' + Date.now();
    const incharge: UserProfile = {
      uid,
      name: data.name,
      email: cleanEmail,
      phone: data.phone,
      role: 'FOOD_INCHARGE',
      institutionId: data.institutionId || '',
      institutionName: data.institutionName || '',
      messId: data.messId,
      messName: data.messName,
      isApproved: true,
      createdAt: Date.now()
    };

    const list = getLocalOrSeed<UserProfile>('users', []);
    setLocal('users', [...list.filter(u => u.email.toLowerCase() !== cleanEmail), incharge]);

    const cleanIncharge = sanitizeForFirestore(incharge);
    withTimeout(setRtdb(ref(rtdb, `users/${uid}`), cleanIncharge), 4000).catch((e) => {
      console.warn('Provision incharge RTDB sync error:', e);
    });
    const emailKey = cleanEmail.replace(/[.#$[\]]/g, '_');
    withTimeout(setRtdb(ref(rtdb, `users/${emailKey}`), cleanIncharge), 4000).catch(() => {});

    // Fallback to Firestore
    withTimeout(setDoc(doc(db, 'users', uid), cleanIncharge), 4000).catch(() => {});

    if (data.messId) {
      await this.updateMess(data.messId, { inchargeUid: uid, inchargeName: data.name }, adminUid);
    }

    // Send automated personalized email with default password
    const senderEmail = data.adminEmail || 'admin@messup.campus';
    const emailDispatch = await EmailNotificationService.sendWelcomeEmail({
      recipientName: data.name,
      recipientEmail: data.email,
      role: 'FOOD_INCHARGE',
      temporaryPassword: 'Incharge@123',
      portalName: 'MessUP Food Incharge Portal',
      assignedMess: data.messName,
      institutionName: incharge.institutionName,
      senderEmail,
      senderName: 'MessUP Campus Administration'
    });

    this.logAction(
      'PROVISION_FOOD_INCHARGE',
      'USER',
      uid,
      adminUid,
      'Admin',
      `Provisioned Food Incharge ${data.name} for Mess ${data.messName} - Welcome email sent from ${senderEmail}`
    ).catch(() => {});

    return { incharge, emailDispatch };
  }

  // --- MENUS ---
  static subscribeMenus(callback: (menus: MenuEntry[]) => void): () => void {
    return onValue(ref(rtdb, 'menuEntries'), (snapshot) => {
      const rtdbItems = rtdbSnapshotToItems<MenuEntry>(snapshot);
      const localItems = getLocalOrSeed<MenuEntry>('menus', []);
      const merged = mergeMenus(localItems, rtdbItems);
      setLocal('menus', merged);
      callback(merged);
    }, (e) => {
      console.warn('Real-time menus error:', e);
      callback(getLocalOrSeed<MenuEntry>('menus', []));
    });
  }

  static async getMenus(): Promise<MenuEntry[]> {
    try {
      const snap = await withTimeout(getRtdb(ref(rtdb, 'menuEntries')), 3000);
      const rtdbItems = rtdbSnapshotToItems<MenuEntry>(snap);
      const localItems = getLocalOrSeed<MenuEntry>('menus', []);
      const merged = mergeMenus(localItems, rtdbItems);
      setLocal('menus', merged);
      return merged;
    } catch (e) {
      console.warn('RTDB menus fallback:', e);
    }
    return getLocalOrSeed<MenuEntry>('menus', []);
  }

  static async saveMenu(menu: MenuEntry, adminUid: string): Promise<MenuEntry> {
    const id = `${menu.messId}_${menu.date}_${menu.mealType}`;
    const payload: MenuEntry = sanitizeForFirestore({
      ...menu,
      id,
      updatedAt: Date.now(),
      updatedBy: adminUid
    });

    const list = getLocalOrSeed<MenuEntry>('menus', []);
    const existingIndex = list.findIndex(
      m => m.id === id || (m.messId === menu.messId && m.date === menu.date && m.mealType === menu.mealType)
    );
    const updated = existingIndex >= 0 
      ? list.map((m, idx) => idx === existingIndex ? payload : m)
      : [...list, payload];
    setLocal('menus', updated);

    withTimeout(setRtdb(ref(rtdb, `menuEntries/${id}`), payload), 4000).catch((e) => {
      console.warn('Save menu RTDB sync error:', e);
    });
    withTimeout(setDoc(doc(db, 'menuEntries', id), payload, { merge: true }), 4000).catch(() => {});

    this.logAction(
      'SAVE_MENU',
      'MENU',
      id,
      adminUid,
      'Admin',
      `Saved menu for ${menu.mealType} on ${menu.date} with ${menu.dishes.length} dishes`
    ).catch(() => {});

    return payload;
  }

  static async toggleDishAvailability(
    menuId: string,
    dishId: string,
    adminUid: string
  ): Promise<MenuEntry | null> {
    const list = getLocalOrSeed<MenuEntry>('menus', []);
    const menu = list.find(m => m.id === menuId);
    if (!menu) return null;

    const updatedDishes = menu.dishes.map(d =>
      d.id === dishId ? { ...d, isAvailable: !d.isAvailable } : d
    );
    const updatedMenu: MenuEntry = {
      ...menu,
      dishes: updatedDishes,
      updatedAt: Date.now(),
      updatedBy: adminUid
    };

    const updatedList = list.map(m => m.id === menuId ? updatedMenu : m);
    setLocal('menus', updatedList);

    const clean = sanitizeForFirestore(updatedMenu);
    withTimeout(setRtdb(ref(rtdb, `menuEntries/${menuId}`), clean), 4000).catch((e) => {
      console.warn('Toggle dish availability RTDB sync error:', e);
    });
    withTimeout(setDoc(doc(db, 'menuEntries', menuId), clean, { merge: true }), 4000).catch(() => {});

    const dish = menu.dishes.find(d => d.id === dishId);
    this.logAction(
      'TOGGLE_DISH_AVAILABILITY',
      'MENU',
      menuId,
      adminUid,
      'Admin',
      `Toggled dish "${dish?.name || dishId}" in ${menu.mealType}`
    ).catch(() => {});

    return updatedMenu;
  }

  static async deleteMenu(id: string, adminUid: string): Promise<void> {
    markAsDeleted(id);
    const list = getLocalOrSeed<MenuEntry>('menus', []);
    const existing = list.find(m => m.id === id);
    const updated = list.filter(m => m.id !== id);
    setLocal('menus', updated);

    withTimeout(removeRtdb(ref(rtdb, `menuEntries/${id}`)), 4000).catch((e) => {
      console.warn('Delete menu RTDB sync error:', e);
    });
    withTimeout(deleteDoc(doc(db, 'menuEntries', id)), 4000).catch(() => {});

    this.logAction(
      'DELETE_MENU',
      'MENU',
      id,
      adminUid,
      'Admin',
      `Deleted menu schedule for ${existing?.mealType || id} on ${existing?.date || ''}`
    ).catch(() => {});
  }

  // --- RATINGS ---
  static subscribeRatings(callback: (ratings: MealRating[]) => void): () => void {
    return onValue(ref(rtdb, 'mealRatings'), (snapshot) => {
      const items = rtdbSnapshotToItems<MealRating>(snapshot)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const localItems = getLocalOrSeed<MealRating>('ratings', []);
      const merged = mergeRatings(localItems, items);
      setLocal('ratings', merged);
      callback(merged);
    }, (e) => {
      console.warn('Real-time ratings error:', e);
      callback(getLocalOrSeed<MealRating>('ratings', []));
    });
  }

  static async getRatings(): Promise<MealRating[]> {
    try {
      const snap = await withTimeout(getRtdb(ref(rtdb, 'mealRatings')), 3000);
      const rtdbItems = rtdbSnapshotToItems<MealRating>(snap);
      const localItems = getLocalOrSeed<MealRating>('ratings', []);
      const merged = mergeRatings(localItems, rtdbItems);
      setLocal('ratings', merged);
      return merged;
    } catch (e) {
      console.warn('RTDB ratings fallback:', e);
    }
    return getLocalOrSeed<MealRating>('ratings', []);
  }

  static async updateRating(
    id: string,
    updates: Partial<MealRating>,
    adminUid: string
  ): Promise<MealRating> {
    const list = getLocalOrSeed<MealRating>('ratings', []);
    const existing = list.find(r => r.id === id);
    if (!existing) {
      throw new Error(`Rating with ID ${id} not found.`);
    }

    const cleanUpdates = sanitizeForFirestore(updates);
    const updated: MealRating = {
      ...existing,
      ...cleanUpdates,
      id
    };

    const updatedList = list.map(r => r.id === id ? updated : r);
    setLocal('ratings', updatedList);

    withTimeout(
      updateRtdb(ref(rtdb, `mealRatings/${id}`), cleanUpdates),
      4000
    ).catch((e) => {
      console.warn('Update rating RTDB sync error:', e);
    });
    withTimeout(setDoc(doc(db, 'mealRatings', id), cleanUpdates, { merge: true }), 4000).catch(() => {});

    this.logAction(
      'UPDATE_RATING',
      'RATING',
      id,
      adminUid,
      'Admin',
      `Updated rating for ${updated.studentName} (${updated.mealType} on ${updated.date})`,
      existing,
      cleanUpdates
    ).catch(() => {});

    return updated;
  }

  static async deleteRating(id: string, adminUid: string): Promise<void> {
    markAsDeleted(id);
    const list = getLocalOrSeed<MealRating>('ratings', []);
    const existing = list.find(r => r.id === id);
    const updated = list.filter(r => r.id !== id);
    setLocal('ratings', updated);

    withTimeout(removeRtdb(ref(rtdb, `mealRatings/${id}`)), 4000).catch((e) => {
      console.warn('Delete rating RTDB sync error:', e);
    });
    withTimeout(deleteDoc(doc(db, 'mealRatings', id)), 4000).catch(() => {});

    this.logAction(
      'DELETE_RATING',
      'RATING',
      id,
      adminUid,
      'Admin',
      `Deleted rating by ${existing?.studentName || id} for ${existing?.mealType || ''}`
    ).catch(() => {});
  }

  static async createRating(
    ratingData: Omit<MealRating, 'id' | 'createdAt'>,
    adminUid: string
  ): Promise<MealRating> {
    const studentIdentifier = ratingData.studentId?.trim() || 'ADMIN_ENTRY';
    const ratingId = `${studentIdentifier}_${ratingData.messId}_${ratingData.date}_${ratingData.mealType}_${Date.now().toString().slice(-4)}`;
    const newRating: MealRating = {
      ...ratingData,
      id: ratingId,
      createdAt: Date.now()
    };

    const clean = sanitizeForFirestore(newRating);
    const list = getLocalOrSeed<MealRating>('ratings', []);
    setLocal('ratings', [newRating, ...list]);

    withTimeout(setRtdb(ref(rtdb, `mealRatings/${ratingId}`), clean), 4000).catch((e) => {
      console.warn('Create rating RTDB sync error:', e);
    });
    withTimeout(setDoc(doc(db, 'mealRatings', ratingId), clean), 4000).catch(() => {});

    this.logAction(
      'CREATE_RATING',
      'RATING',
      ratingId,
      adminUid,
      'Admin',
      `Logged meal rating for ${newRating.studentName} (${newRating.mealType} on ${newRating.date})`
    ).catch(() => {});

    return newRating;
  }

  static async moderateRating(id: string, isModerated: boolean, reason: string, adminUid: string): Promise<void> {
    const list = getLocalOrSeed<MealRating>('ratings', []);
    const updated = list.map(r => r.id === id ? { ...r, isModerated, moderationReason: reason } : r);
    setLocal('ratings', updated);

    withTimeout(updateRtdb(ref(rtdb, `mealRatings/${id}`), { isModerated, moderationReason: reason }), 4000).catch((e) => {
      console.warn('Moderate rating RTDB error:', e);
    });
    withTimeout(setDoc(doc(db, 'mealRatings', id), { isModerated, moderationReason: reason }, { merge: true }), 4000).catch(() => {});

    this.logAction('MODERATE_RATING', 'RATING', id, adminUid, 'Admin', `Moderation reason: ${reason}`).catch(() => {});
  }

  // --- COMPLAINTS & FEEDBACK ---
  static subscribeComplaints(callback: (complaints: FeedbackComplaint[]) => void): () => void {
    return onValue(ref(rtdb, 'feedback'), (snapshot) => {
      const items = rtdbSnapshotToItems<FeedbackComplaint>(snapshot)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setLocal('complaints', items);
      callback(items);
    }, (e) => {
      console.warn('Real-time complaints notice (using campus cache):', e);
      callback(getLocalOrSeed<FeedbackComplaint>('complaints', CAMPUS_COMPLAINTS));
    });
  }

  static async getComplaints(): Promise<FeedbackComplaint[]> {
    try {
      const snap = await withTimeout(getRtdb(ref(rtdb, 'feedback')), 3000);
      const rtdbItems = rtdbSnapshotToItems<FeedbackComplaint>(snap)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setLocal('complaints', rtdbItems);
      return rtdbItems;
    } catch (e) {
      console.warn('RTDB feedback fallback:', e);
    }
    return getLocalOrSeed<FeedbackComplaint>('complaints', CAMPUS_COMPLAINTS);
  }

  static async updateComplaint(
    id: string, 
    updates: Partial<FeedbackComplaint>, 
    adminUid: string,
    adminName: string
  ): Promise<void> {
    const list = getLocalOrSeed<FeedbackComplaint>('complaints', []);
    const existing = list.find(c => c.id === id);
    const cleanUpdates = sanitizeForFirestore(updates);
    const updated = list.map(c => c.id === id ? { ...c, ...cleanUpdates } : c);
    setLocal('complaints', updated);

    withTimeout(updateRtdb(ref(rtdb, `feedback/${id}`), cleanUpdates), 4000).catch((e) => {
      console.warn('Update complaint RTDB sync error:', e);
    });
    withTimeout(setDoc(doc(db, 'feedback', id), cleanUpdates, { merge: true }), 4000).catch(() => {});

    this.logAction(
      'UPDATE_COMPLAINT',
      'COMPLAINT',
      id,
      adminUid,
      adminName,
      `Updated status to ${updates.status || existing?.status}`,
      existing,
      updates
    ).catch(() => {});
  }

  // --- ANNOUNCEMENTS ---
  static subscribeAnnouncements(callback: (announcements: Announcement[]) => void): () => void {
    return onValue(ref(rtdb, 'announcements'), (snapshot) => {
      const items = rtdbSnapshotToItems<Announcement>(snapshot)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const localItems = getLocalOrSeed<Announcement>('announcements', []);
      const merged = mergeEntities(localItems, items);
      setLocal('announcements', merged);
      callback(merged);
    }, (e) => {
      console.warn('Real-time announcements RTDB notice:', e);
      callback(getLocalOrSeed<Announcement>('announcements', []));
    });
  }

  static async getAnnouncements(): Promise<Announcement[]> {
    try {
      const snap = await withTimeout(getRtdb(ref(rtdb, 'announcements')), 3000);
      const rtdbItems = rtdbSnapshotToItems<Announcement>(snap);
      const localItems = getLocalOrSeed<Announcement>('announcements', []);
      const merged = mergeEntities(localItems, rtdbItems);
      setLocal('announcements', merged);
      return merged;
    } catch (e) {
      console.warn('RTDB announcements fallback:', e);
    }
    return getLocalOrSeed<Announcement>('announcements', []);
  }

  static async createAnnouncement(
    ann: Omit<Announcement, 'id' | 'createdAt'>,
    adminUid: string,
    adminName: string
  ): Promise<Announcement> {
    const id = 'ANN_' + Date.now();
    const newAnn: Announcement = { ...ann, id, createdAt: Date.now() };

    const list = getLocalOrSeed<Announcement>('announcements', []);
    setLocal('announcements', [newAnn, ...list]);

    withTimeout(setRtdb(ref(rtdb, `announcements/${id}`), sanitizeForFirestore(newAnn)), 4000).catch((e) => {
      console.warn('Create announcement RTDB sync error:', e);
    });
    withTimeout(setDoc(doc(db, 'announcements', id), newAnn), 4000).catch(() => {});

    this.logAction('CREATE_ANNOUNCEMENT', 'ANNOUNCEMENT', id, adminUid, adminName, `Published announcement: ${ann.title}`).catch(() => {});
    return newAnn;
  }

  static async deleteAnnouncement(id: string, adminUid: string = 'admin'): Promise<void> {
    markAsDeleted(id);
    const list = getLocalOrSeed<Announcement>('announcements', []);
    const existing = list.find(a => a.id === id);
    const updated = list.filter(a => a.id !== id);
    setLocal('announcements', updated);

    withTimeout(removeRtdb(ref(rtdb, `announcements/${id}`)), 4000).catch((e) => {
      console.warn('Delete announcement RTDB sync error:', e);
    });
    withTimeout(deleteDoc(doc(db, 'announcements', id)), 4000).catch(() => {});

    this.logAction(
      'DELETE_ANNOUNCEMENT',
      'ANNOUNCEMENT',
      id,
      adminUid,
      'Admin',
      `Deleted announcement: ${existing?.title || id}`
    ).catch(() => {});
  }

  static async deleteComplaint(id: string, adminUid: string = 'admin'): Promise<void> {
    markAsDeleted(id);
    const list = getLocalOrSeed<FeedbackComplaint>('complaints', []);
    const existing = list.find(c => c.id === id);
    const updated = list.filter(c => c.id !== id);
    setLocal('complaints', updated);

    withTimeout(removeRtdb(ref(rtdb, `feedback/${id}`)), 4000).catch((e) => {
      console.warn('Delete complaint RTDB sync error:', e);
    });
    withTimeout(deleteDoc(doc(db, 'feedback', id)), 4000).catch(() => {});

    this.logAction(
      'DELETE_COMPLAINT',
      'COMPLAINT',
      id,
      adminUid,
      'Admin',
      `Deleted complaint/feedback: ${existing?.description?.slice(0, 30) || id}`
    ).catch(() => {});
  }
}
