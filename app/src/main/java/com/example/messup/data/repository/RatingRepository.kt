package com.example.messup.data.repository

import com.example.messup.data.model.AggregateMessStats
import com.example.messup.data.model.MealRating
import com.example.messup.data.model.MealType
import com.example.messup.data.model.RatingDimensions
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.round

class RatingRepository {

    private val rtdb: FirebaseDatabase? by lazy {
        runCatching {
            FirebaseDatabase.getInstance("https://messup-ee9fc-default-rtdb.firebaseio.com")
        }.getOrNull()
    }

    private val firestore: FirebaseFirestore? by lazy {
        runCatching { FirebaseFirestore.getInstance() }.getOrNull()
    }

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

    private val _allRatings = MutableStateFlow<List<MealRating>>(emptyList())
    val allRatings: StateFlow<List<MealRating>> = _allRatings.asStateFlow()

    private val _messStats = MutableStateFlow(
        AggregateMessStats(
            overallRating = 0.0f,
            totalRatingsCount = 0,
            breakfastRating = 0.0f,
            lunchRating = 0.0f,
            snacksRating = 0.0f,
            dinnerRating = 0.0f,
            tasteAvg = 0.0f,
            qualityAvg = 0.0f,
            hygieneAvg = 0.0f,
            portionAvg = 0.0f,
            topPositiveTags = emptyList(),
            topNegativeTags = emptyList()
        )
    )
    val messStats: StateFlow<AggregateMessStats> = _messStats.asStateFlow()

    init {
        // 1. Real-time Firebase Realtime Database Listener
        rtdb?.getReference("mealRatings")?.addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                runCatching {
                    val items = mutableListOf<MealRating>()
                    for (child in snapshot.children) {
                        val rawMap = child.value as? Map<*, *> ?: continue
                        val map = rawMap.entries.associate { (k, v) -> k.toString() to (v ?: "") }
                        parseRatingManually(child.key ?: "", map)?.let { items.add(it) }
                    }
                    _allRatings.value = items
                    recalculateStats()
                }
            }
            override fun onCancelled(error: DatabaseError) {}
        })

        // 2. Fallback Cloud Firestore Listener for Ratings (Admin <-> Student <-> Incharge sync)
        firestore?.collection("mealRatings")?.addSnapshotListener { snapshot, error ->
            if (error != null || snapshot == null) return@addSnapshotListener
            runCatching {
                val items = snapshot.documents.mapNotNull { doc ->
                    doc.toObject(MealRating::class.java)?.copy(id = doc.id)
                }
                if (items.isNotEmpty()) {
                    _allRatings.value = items
                    recalculateStats()
                }
            }
        }
    }

    private fun parseRatingManually(ratingId: String, data: Map<String, Any?>): MealRating? {
        return try {
            val mealTypeStr = data["mealType"]?.toString() ?: MealType.BREAKFAST.name
            val mealType = runCatching { MealType.valueOf(mealTypeStr) }.getOrDefault(MealType.BREAKFAST)

            val rawRatings = data["ratings"] as? Map<*, *>
            val taste = (rawRatings?.get("taste") as? Number)?.toFloat() ?: rawRatings?.get("taste")?.toString()?.toFloatOrNull() ?: 0f
            val quality = (rawRatings?.get("quality") as? Number)?.toFloat() ?: rawRatings?.get("quality")?.toString()?.toFloatOrNull() ?: 0f
            val hygiene = (rawRatings?.get("hygiene") as? Number)?.toFloat() ?: rawRatings?.get("hygiene")?.toString()?.toFloatOrNull() ?: 0f
            val portion = (rawRatings?.get("portion") as? Number)?.toFloat() ?: rawRatings?.get("portion")?.toString()?.toFloatOrNull() ?: 0f
            val rawOverall = (rawRatings?.get("overall") as? Number)?.toFloat() ?: rawRatings?.get("overall")?.toString()?.toFloatOrNull() ?: 0f
            val overall = if (rawOverall > 0f) rawOverall else {
                val nonZero = listOf(taste, quality, hygiene, portion).filter { it > 0f }
                if (nonZero.isNotEmpty()) nonZero.average().toFloat() else 0f
            }

            val rawTags = data["tags"] as? List<*>
            val tags = rawTags?.mapNotNull { it?.toString() } ?: emptyList()

            val isModVal = when (val m = data["isModerated"]) {
                is Boolean -> m
                is String -> m.toBooleanStrictOrNull() ?: false
                else -> false
            }
            val createdAtVal = when (val c = data["createdAt"]) {
                is Number -> c.toLong()
                is String -> c.toLongOrNull() ?: System.currentTimeMillis()
                else -> System.currentTimeMillis()
            }

            MealRating(
                id = ratingId,
                studentId = data["studentId"]?.toString() ?: "",
                studentName = data["studentName"]?.toString() ?: "",
                messId = data["messId"]?.toString() ?: "MESS_001",
                date = data["date"]?.toString() ?: "",
                mealType = mealType,
                ratings = RatingDimensions(
                    taste = taste,
                    quality = quality,
                    hygiene = hygiene,
                    portion = portion,
                    overall = overall
                ),
                tags = tags,
                comment = data["comment"]?.toString() ?: "",
                isModerated = isModVal,
                moderationReason = data["moderationReason"]?.toString(),
                createdAt = createdAtVal
            )
        } catch (_: Exception) {
            null
        }
    }

    fun submitRating(
        studentId: String,
        studentName: String,
        messId: String = "MESS_001",
        date: String,
        mealType: MealType,
        taste: Float,
        quality: Float,
        hygiene: Float,
        portion: Float,
        overall: Float,
        tags: List<String>,
        comment: String
    ): Result<MealRating> {
        return runCatching {
            val effectiveMessId = if (messId.isNotBlank()) messId else "MESS_001"
            val ratingId = "${studentId}_${effectiveMessId}_${date}_${mealType.name}"

            val newRating = MealRating(
                id = ratingId,
                studentId = studentId,
                studentName = studentName,
                messId = effectiveMessId,
                date = date,
                mealType = mealType,
                ratings = RatingDimensions(
                    taste = taste,
                    quality = quality,
                    hygiene = hygiene,
                    portion = portion,
                    overall = overall
                ),
                tags = tags,
                comment = comment,
                isModerated = false,
                createdAt = System.currentTimeMillis()
            )

            val list = _allRatings.value.toMutableList()
            val existingIndex = list.indexOfFirst { it.id == ratingId }
            if (existingIndex != -1) {
                list[existingIndex] = newRating
            } else {
                list.add(0, newRating)
            }

            _allRatings.value = list
            recalculateStats()

            // 1. Sync to Firebase Realtime Database
            val ratingsMap = hashMapOf<String, Any>(
                "taste" to taste,
                "quality" to quality,
                "hygiene" to hygiene,
                "portion" to portion,
                "overall" to overall
            )
            val rtdbPayload = hashMapOf<String, Any?>(
                "id" to ratingId,
                "studentId" to studentId,
                "studentName" to studentName,
                "messId" to effectiveMessId,
                "date" to date,
                "mealType" to mealType.name,
                "ratings" to ratingsMap,
                "tags" to tags,
                "comment" to comment,
                "isModerated" to false,
                "createdAt" to newRating.createdAt
            )
            runCatching {
                rtdb?.getReference("mealRatings")?.child(ratingId)?.setValue(rtdbPayload)
            }
            // 2. Sync to Cloud Firestore fallback
            runCatching {
                firestore?.collection("mealRatings")?.document(ratingId)?.set(rtdbPayload)
            }

            newRating
        }
    }

    fun getStudentRatingForMeal(studentId: String, messId: String, date: String, mealType: MealType): MealRating? {
        val effectiveMessId = if (messId.isNotBlank()) messId else "MESS_001"
        val ratingId = "${studentId}_${effectiveMessId}_${date}_${mealType.name}"
        return _allRatings.value.find { it.id == ratingId }
    }

    private fun round1Decimal(value: Float): Float {
        if (value.isNaN() || value.isInfinite() || value < 0f) return 0.0f
        return (round(value * 10f) / 10f).coerceIn(0f, 5f)
    }

    fun getStatsForMess(messId: String): AggregateMessStats {
        val activeRatings = _allRatings.value.filter { 
            !it.isModerated && (messId.isBlank() || it.messId.isBlank() || it.messId == messId) 
        }
        return computeStats(activeRatings, messId)
    }

    private fun recalculateStats() {
        _messStats.value = computeStats(_allRatings.value.filter { !it.isModerated }, "")
    }

    private fun computeStats(activeRatings: List<MealRating>, messId: String): AggregateMessStats {
        if (activeRatings.isEmpty()) {
            return AggregateMessStats(
                messId = messId,
                overallRating = 0.0f,
                totalRatingsCount = 0,
                breakfastRating = 0.0f,
                lunchRating = 0.0f,
                snacksRating = 0.0f,
                dinnerRating = 0.0f,
                tasteAvg = 0.0f,
                qualityAvg = 0.0f,
                hygieneAvg = 0.0f,
                portionAvg = 0.0f,
                topPositiveTags = emptyList(),
                topNegativeTags = emptyList()
            )
        }

        fun getEffectiveRating(r: MealRating): Float {
            if (r.ratings.overall > 0f) return r.ratings.overall
            val dims = listOf(r.ratings.taste, r.ratings.quality, r.ratings.hygiene, r.ratings.portion).filter { it > 0f }
            return if (dims.isNotEmpty()) dims.average().toFloat() else 0f
        }

        fun avgDimension(selector: (MealRating) -> Float): Float {
            val nonZero = activeRatings.map(selector).filter { it > 0f }
            return if (nonZero.isNotEmpty()) nonZero.average().toFloat() else 0f
        }

        fun avgForMeal(meal: MealType): Float {
            val mealList = activeRatings.filter { it.mealType == meal }
            val effective = mealList.map { getEffectiveRating(it) }.filter { it > 0f }
            return if (effective.isNotEmpty()) effective.average().toFloat() else 0.0f
        }

        val overallScores = activeRatings.map { getEffectiveRating(it) }.filter { it > 0f }
        val overallAvg = if (overallScores.isNotEmpty()) overallScores.average().toFloat() else 0.0f
        val tasteAvgVal = avgDimension { it.ratings.taste }
        val qualityAvgVal = avgDimension { it.ratings.quality }
        val hygieneAvgVal = avgDimension { it.ratings.hygiene }
        val portionAvgVal = avgDimension { it.ratings.portion }

        val tagCounts = activeRatings.flatMap { it.tags }.groupingBy { it }.eachCount()
        val topPositive = tagCounts.filterKeys { 
            !it.contains("spicy", ignoreCase = true) && 
            !it.contains("cold", ignoreCase = true) && 
            !it.contains("salty", ignoreCase = true) 
        }.toList().sortedByDescending { it.second }.take(5)

        val topNegative = tagCounts.filterKeys { 
            it.contains("spicy", ignoreCase = true) || 
            it.contains("cold", ignoreCase = true) || 
            it.contains("salty", ignoreCase = true) 
        }.toList().sortedByDescending { it.second }.take(5)

        return AggregateMessStats(
            messId = messId,
            overallRating = round1Decimal(overallAvg),
            totalRatingsCount = activeRatings.size,
            breakfastRating = round1Decimal(avgForMeal(MealType.BREAKFAST)),
            lunchRating = round1Decimal(avgForMeal(MealType.LUNCH)),
            snacksRating = round1Decimal(avgForMeal(MealType.SNACKS)),
            dinnerRating = round1Decimal(avgForMeal(MealType.DINNER)),
            tasteAvg = round1Decimal(tasteAvgVal),
            qualityAvg = round1Decimal(qualityAvgVal),
            hygieneAvg = round1Decimal(hygieneAvgVal),
            portionAvg = round1Decimal(portionAvgVal),
            topPositiveTags = topPositive,
            topNegativeTags = topNegative
        )
    }
}
