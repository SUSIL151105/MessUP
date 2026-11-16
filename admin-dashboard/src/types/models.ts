export type UserRole = 'STUDENT' | 'FOOD_INCHARGE' | 'ADMIN';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  institutionId?: string;
  institutionName?: string;
  hostelId?: string;
  hostelName?: string;
  messId?: string;
  messName?: string;
  isApproved: boolean;
  isSuspended?: boolean;
  createdAt: number;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  location: string;
  createdAt?: number;
}

export interface Hostel {
  id: string;
  institutionId: string;
  name: string;
  block?: string;
  capacity?: number;
}

export interface Mess {
  id: string;
  institutionId: string;
  hostelId?: string;
  name: string;
  location: string;
  inchargeUid: string;
  inchargeName?: string;
  capacity?: number;
}

export type MealType = 'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER';

export interface DishItem {
  id: string;
  name: string;
  description: string;
  isVeg: boolean;
  isNonVeg?: boolean;
  containsEgg?: boolean;
  allergens?: string[];
  isAvailable: boolean;
}

export interface MenuEntry {
  id: string;
  messId: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  dishes: DishItem[];
  isPublished: boolean;
  isCancelled: boolean;
  cancellationReason?: string;
  updatedAt: number;
  updatedBy: string;
}

export interface RatingDimensions {
  taste: number;
  quality: number;
  hygiene: number;
  portion: number;
  overall: number;
}

export interface MealRating {
  id: string; // studentId_messId_date_mealType
  studentId: string;
  studentName: string;
  messId: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  ratings: RatingDimensions;
  tags: string[];
  comment: string;
  createdAt: number;
  isModerated?: boolean;
  moderationReason?: string;
}

export type FeedbackCategory =
  | 'FOOD_QUALITY'
  | 'HYGIENE'
  | 'SERVICE'
  | 'TIMINGS'
  | 'PORTION_SIZE'
  | 'MENU_VARIETY'
  | 'OTHER';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ACTION_PLANNED'
  | 'RESOLVED'
  | 'CLOSED';

export interface FeedbackComplaint {
  id: string;
  studentId: string;
  studentName: string;
  messId: string;
  category: FeedbackCategory;
  mealType?: MealType;
  date: string;
  description: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  gpsLocationTag?: string;
  isPrivate: boolean;
  status: ComplaintStatus;
  officialResponse?: string;
  respondedBy?: string;
  respondedAt?: number;
  assignedToInchargeId?: string;
  assignedToInchargeName?: string;
  internalAdminNotes?: string;
  createdAt: number;
}

export type NoticePriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

export interface Announcement {
  id: string;
  messId: string;
  title: string;
  content: string;
  priority: NoticePriority;
  createdBy: string;
  createdByName: string;
  targetRole?: string;
  createdAt: number;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  performedByName?: string;
  details: string;
  beforeValue?: string;
  afterValue?: string;
  timestamp: number;
}

export interface AggregateMessStats {
  messId: string;
  overallRating: number;
  totalRatingsCount: number;
  breakfastRating: number;
  lunchRating: number;
  snacksRating: number;
  dinnerRating: number;
  tasteAvg: number;
  qualityAvg: number;
  hygieneAvg: number;
  portionAvg: number;
  openComplaintsCount: number;
  resolvedComplaintsCount: number;
}
