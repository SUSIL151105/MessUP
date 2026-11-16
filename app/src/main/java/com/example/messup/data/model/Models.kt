package com.example.messup.data.model

import com.google.firebase.firestore.IgnoreExtraProperties
import com.google.firebase.firestore.PropertyName
import java.util.UUID

enum class UserRole {
    STUDENT,
    FOOD_INCHARGE,
    ADMIN
}

@IgnoreExtraProperties
data class UserProfile(
    val uid: String = "",
    val name: String = "",
    val email: String = "",
    val phone: String = "",
    val role: UserRole = UserRole.STUDENT,
    val institutionId: String = "",
    val institutionName: String = "",
    val hostelId: String = "",
    val hostelName: String = "",
    val messId: String = "",
    val messName: String = "",
    @get:PropertyName("isApproved") @set:PropertyName("isApproved") var isApproved: Boolean = false,
    @get:PropertyName("isSuspended") @set:PropertyName("isSuspended") var isSuspended: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)

@IgnoreExtraProperties
data class Institution(
    val id: String = "",
    val name: String = "",
    val code: String = "",
    val location: String = "",
    val createdAt: Long = 0L
)

@IgnoreExtraProperties
data class Hostel(
    val id: String = "",
    val institutionId: String = "",
    val name: String = "",
    val block: String = "",
    val capacity: Int = 400
)

@IgnoreExtraProperties
data class Mess(
    val id: String = "",
    val institutionId: String = "",
    val hostelId: String = "",
    val name: String = "",
    val location: String = "",
    val inchargeUid: String = "",
    val inchargeName: String = "",
    val capacity: Int = 400
)

enum class MealType(val displayName: String, val timeSlot: String) {
    BREAKFAST("Breakfast", "07:30 AM - 09:30 AM"),
    LUNCH("Lunch", "12:30 PM - 02:30 PM"),
    SNACKS("Evening Snacks", "05:00 PM - 06:00 PM"),
    DINNER("Dinner", "07:30 PM - 09:30 PM")
}

@IgnoreExtraProperties
data class DishItem(
    val id: String = UUID.randomUUID().toString(),
    val name: String = "",
    val description: String = "",
    @get:PropertyName("isVeg") @set:PropertyName("isVeg") var isVeg: Boolean = true,
    @get:PropertyName("isNonVeg") @set:PropertyName("isNonVeg") var isNonVeg: Boolean = false,
    @get:PropertyName("containsEgg") @set:PropertyName("containsEgg") var containsEgg: Boolean = false,
    val allergens: List<String> = emptyList(),
    @get:PropertyName("isAvailable") @set:PropertyName("isAvailable") var isAvailable: Boolean = true
)

@IgnoreExtraProperties
data class MenuEntry(
    val id: String = "",
    val messId: String = "",
    val date: String = "", // YYYY-MM-DD
    val mealType: MealType = MealType.BREAKFAST,
    val dishes: List<DishItem> = emptyList(),
    @get:PropertyName("isPublished") @set:PropertyName("isPublished") var isPublished: Boolean = true,
    @get:PropertyName("isCancelled") @set:PropertyName("isCancelled") var isCancelled: Boolean = false,
    val cancellationReason: String? = null,
    val updatedAt: Long = System.currentTimeMillis(),
    val updatedBy: String = ""
)

@IgnoreExtraProperties
data class RatingDimensions(
    val taste: Float = 0f,
    val quality: Float = 0f,
    val hygiene: Float = 0f,
    val portion: Float = 0f,
    val overall: Float = 0f
) {
    fun average(): Float {
        val list = listOf(taste, quality, hygiene, portion, overall).filter { it > 0f }
        return if (list.isNotEmpty()) list.average().toFloat() else 0f
    }
}

@IgnoreExtraProperties
data class MealRating(
    val id: String = "", // studentId_messId_date_mealType
    val studentId: String = "",
    val studentName: String = "",
    val messId: String = "",
    val date: String = "", // YYYY-MM-DD
    val mealType: MealType = MealType.BREAKFAST,
    val ratings: RatingDimensions = RatingDimensions(),
    val tags: List<String> = emptyList(),
    val comment: String = "",
    @get:PropertyName("isModerated") @set:PropertyName("isModerated") var isModerated: Boolean = false,
    val moderationReason: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

enum class FeedbackCategory(val displayName: String) {
    FOOD_QUALITY("Food Quality"),
    HYGIENE("Hygiene & Cleanliness"),
    SERVICE("Staff & Service"),
    TIMINGS("Meal Timings"),
    PORTION_SIZE("Portion Size"),
    MENU_VARIETY("Menu Variety"),
    OTHER("Other Issues")
}

enum class ComplaintStatus(val displayName: String) {
    SUBMITTED("Submitted"),
    UNDER_REVIEW("Under Review"),
    ACTION_PLANNED("Action Planned"),
    RESOLVED("Resolved"),
    CLOSED("Closed")
}

@IgnoreExtraProperties
data class FeedbackComplaint(
    val id: String = UUID.randomUUID().toString(),
    val studentId: String = "",
    val studentName: String = "",
    val messId: String = "",
    val category: FeedbackCategory = FeedbackCategory.FOOD_QUALITY,
    val mealType: MealType? = null,
    val date: String = "",
    val description: String = "",
    val photoUrl: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val gpsLocationTag: String? = null,
    @get:PropertyName("isPrivate") @set:PropertyName("isPrivate") var isPrivate: Boolean = false,
    @get:PropertyName("reportedToAdmin") @set:PropertyName("reportedToAdmin") var reportedToAdmin: Boolean = true,
    @get:PropertyName("reportedToIncharge") @set:PropertyName("reportedToIncharge") var reportedToIncharge: Boolean = true,
    val status: ComplaintStatus = ComplaintStatus.SUBMITTED,
    val officialResponse: String? = null,
    val respondedBy: String? = null,
    val respondedAt: Long? = null,
    val assignedToInchargeId: String? = null,
    val assignedToInchargeName: String? = null,
    val internalAdminNotes: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

enum class NoticePriority(val displayName: String) {
    NORMAL("Normal"),
    IMPORTANT("Important"),
    URGENT("Urgent")
}

@IgnoreExtraProperties
data class Announcement(
    val id: String = UUID.randomUUID().toString(),
    val messId: String = "",
    val title: String = "",
    val content: String = "",
    val priority: NoticePriority = NoticePriority.NORMAL,
    val createdBy: String = "",
    val createdByName: String = "",
    val targetRole: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

@IgnoreExtraProperties
data class AuditLog(
    val id: String = UUID.randomUUID().toString(),
    val action: String = "",
    val entityType: String = "",
    val entityId: String = "",
    val performedBy: String = "",
    val details: String = "",
    val timestamp: Long = System.currentTimeMillis()
)

data class AggregateMessStats(
    val messId: String = "",
    val overallRating: Float = 0.0f,
    val totalRatingsCount: Int = 0,
    val breakfastRating: Float = 0.0f,
    val lunchRating: Float = 0.0f,
    val snacksRating: Float = 0.0f,
    val dinnerRating: Float = 0.0f,
    val tasteAvg: Float = 0.0f,
    val qualityAvg: Float = 0.0f,
    val hygieneAvg: Float = 0.0f,
    val portionAvg: Float = 0.0f,
    val openComplaintsCount: Int = 0,
    val resolvedComplaintsCount: Int = 0,
    val topPositiveTags: List<Pair<String, Int>> = emptyList(),
    val topNegativeTags: List<Pair<String, Int>> = emptyList()
)
