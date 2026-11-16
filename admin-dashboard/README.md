# MessUP Production Admin Dashboard
> **Every Meal Matters.**

This directory houses the web-based Administrator Management Dashboard for **MessUP**, paired with the Android application.

## 1. Tech Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 with bespoke Food-Tech Theme (Forest Green `#14532d`, Lime Green `#84cc16`, Neutral Slate)
- **Icons & Visuals:** Lucide React
- **Analytics & Graphs:** Recharts
- **Database & Auth:** Firebase Auth, Cloud Firestore (`messup-ee9fc`), Real-Time Snapshot Sync

## 2. Shared Data Architecture with Android Application
The Admin Dashboard connects directly to the same authoritative Cloud Firestore backend used by students and food incharges in the Android Kotlin app:

| Entity / Collection | Android Kotlin Model | Web Dashboard Type | Scope |
| :--- | :--- | :--- | :--- |
| `users` | `UserProfile` | `UserProfile` | Admins, Incharges, Students |
| `institutions` | `Institution` | `Institution` | University / College nodes |
| `messes` | `Mess` | `Mess` | Mess dining blocks |
| `menuEntries` | `MenuEntry`, `DishItem` | `MenuEntry`, `DishItem` | 4 Daily slots (Breakfast, Lunch, Snacks, Dinner) |
| `mealRatings` | `MealRating`, `RatingDimensions` | `MealRating`, `RatingDimensions` | Taste, Quality, Hygiene, Portion scores |
| `feedback` | `FeedbackComplaint` | `FeedbackComplaint` | Student grievance tickets & official replies |
| `announcements` | `Announcement` | `Announcement` | Broadcast notices to Android apps |
| `auditLogs` | `AuditLog` | `AuditLog` | Append-only administrative security trails |

## 3. Provisioning the Initial Super Administrator
To provision your first administrative account securely:
1. Open the Admin Dashboard: `http://localhost:5173/`
2. You can immediately access the local pre-provisioned session using **"Enter as Provisioned Super Admin"**.
3. For live Firebase Authentication:
   - Create a user in the Firebase Console Auth tab with an email containing `admin` (e.g. `admin@messup.edu`).
   - Sign in on the dashboard with these credentials; the application automatically initializes an immutable `role: "ADMIN"` document in `/users/{uid}`.
   - [firestore.rules](file:///c:/Users/susil/AndroidStudioProjects/MessUP/firestore.rules) guarantees that non-admin accounts cannot elevate themselves to `ADMIN` or `FOOD_INCHARGE`.

## 4. Provisioning Food Incharges
1. Navigate to **"Food Incharges"** in the sidebar.
2. Click **"Provision Food Incharge"**.
3. Fill in the staff member's official details and select their authorized mess hall.
4. Saving generates the user record with `role: "FOOD_INCHARGE"`, links their UID to the mess hall record, and issues an account activation workflow without requiring or exposing passwords.

## 5. Environment Variables Template (.env)
Create `.env` in `admin-dashboard/` (defaults to current project config):
```env
VITE_FIREBASE_API_KEY=AIzaSyD_ROCiKp7jTbIEui-kEAvYGlZt0rtylAM
VITE_FIREBASE_AUTH_DOMAIN=messup-ee9fc.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=messup-ee9fc
VITE_FIREBASE_STORAGE_BUCKET=messup-ee9fc.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=293579998912
VITE_FIREBASE_APP_ID=1:293579998912:web:messup_admin_dashboard
```

## 6. Build and Verification
To build for production:
```bash
npm run build
```
Production outputs are written to `dist/`.
