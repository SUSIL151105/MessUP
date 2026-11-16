package com.example.messup.data.repository

import android.content.Context
import com.example.messup.data.model.ComplaintStatus
import com.example.messup.data.model.FeedbackCategory
import com.example.messup.data.model.FeedbackComplaint
import com.example.messup.data.model.MealType
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

class FeedbackRepository(private val context: Context? = null) {

    private val rtdb: FirebaseDatabase? by lazy {
        runCatching {
            FirebaseDatabase.getInstance("https://messup-ee9fc-default-rtdb.firebaseio.com")
        }.getOrNull()
    }

    private val firestore: FirebaseFirestore? by lazy {
        runCatching { FirebaseFirestore.getInstance() }.getOrNull()
    }

    private val prefs by lazy {
        context?.getSharedPreferences("messup_feedback_cache", Context.MODE_PRIVATE)
    }

    private val _complaints = MutableStateFlow<List<FeedbackComplaint>>(emptyList())
    val complaints: StateFlow<List<FeedbackComplaint>> = _complaints.asStateFlow()

    init {
        // 1. Load locally cached complaints instantly for immediate offline resilience
        loadCachedComplaints()

        // 2. Real-time Firebase Realtime Database Listener (Live sync across Student, Inspector & Admin)
        rtdb?.getReference("feedback")?.addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                runCatching {
                    val items = mutableListOf<FeedbackComplaint>()
                    for (child in snapshot.children) {
                        val rawMap = child.value as? Map<*, *> ?: continue
                        val map = rawMap.entries.associate { (k, v) -> k.toString() to (v ?: "") }
                        parseDocumentManually(child.key ?: "", map)?.let { items.add(it) }
                    }
                    if (items.isNotEmpty()) {
                        val merged = mergeComplaints(_complaints.value, items)
                        _complaints.value = merged
                        saveComplaintsToCache(merged)
                    }
                }
            }
            override fun onCancelled(error: DatabaseError) {}
        })

        // 3. Fallback Cloud Firestore Listener
        firestore?.collection("feedback")?.addSnapshotListener { snapshot, error ->
            if (error != null || snapshot == null) return@addSnapshotListener
            runCatching {
                val items = snapshot.documents.mapNotNull { doc ->
                    try {
                        doc.toObject(FeedbackComplaint::class.java)?.copy(id = doc.id)
                    } catch (_: Exception) {
                        parseDocumentManually(doc.id, doc.data)
                    }
                }
                if (items.isNotEmpty()) {
                    val merged = mergeComplaints(_complaints.value, items)
                    _complaints.value = merged
                    saveComplaintsToCache(merged)
                }
            }
        }
    }

    private fun parseDocumentManually(docId: String, data: Map<String, Any>?): FeedbackComplaint? {
        if (data == null) return null
        return try {
            val categoryStr = data["category"]?.toString() ?: FeedbackCategory.FOOD_QUALITY.name
            val category = runCatching { FeedbackCategory.valueOf(categoryStr) }.getOrDefault(FeedbackCategory.FOOD_QUALITY)
            val mealTypeStr = data["mealType"]?.toString()
            val mealType = mealTypeStr?.let { runCatching { MealType.valueOf(it) }.getOrNull() }
            val statusStr = data["status"]?.toString() ?: ComplaintStatus.SUBMITTED.name
            val status = runCatching { ComplaintStatus.valueOf(statusStr) }.getOrDefault(ComplaintStatus.SUBMITTED)

            val isPrivateVal = when (val p = data["isPrivate"]) {
                is Boolean -> p
                is String -> p.toBooleanStrictOrNull() ?: false
                else -> false
            }
            val repAdminVal = when (val a = data["reportedToAdmin"]) {
                is Boolean -> a
                is String -> a.toBooleanStrictOrNull() ?: true
                else -> true
            }
            val repInchargeVal = when (val i = data["reportedToIncharge"]) {
                is Boolean -> i
                is String -> i.toBooleanStrictOrNull() ?: true
                else -> true
            }
            val respondedAtVal = when (val r = data["respondedAt"]) {
                is Number -> r.toLong()
                is String -> r.toLongOrNull()
                else -> null
            }
            val createdAtVal = when (val c = data["createdAt"]) {
                is Number -> c.toLong()
                is String -> c.toLongOrNull() ?: System.currentTimeMillis()
                else -> System.currentTimeMillis()
            }

            FeedbackComplaint(
                id = docId,
                studentId = data["studentId"]?.toString() ?: "",
                studentName = data["studentName"]?.toString() ?: "Student",
                messId = data["messId"]?.toString() ?: "MESS_001",
                category = category,
                mealType = mealType,
                date = data["date"]?.toString() ?: "",
                description = data["description"]?.toString() ?: "",
                photoUrl = data["photoUrl"]?.toString(),
                latitude = (data["latitude"] as? Number)?.toDouble() ?: data["latitude"]?.toString()?.toDoubleOrNull(),
                longitude = (data["longitude"] as? Number)?.toDouble() ?: data["longitude"]?.toString()?.toDoubleOrNull(),
                gpsLocationTag = data["gpsLocationTag"]?.toString(),
                isPrivate = isPrivateVal,
                reportedToAdmin = repAdminVal,
                reportedToIncharge = repInchargeVal,
                status = status,
                officialResponse = data["officialResponse"]?.toString(),
                respondedBy = data["respondedBy"]?.toString(),
                respondedAt = respondedAtVal,
                assignedToInchargeId = data["assignedToInchargeId"]?.toString(),
                assignedToInchargeName = data["assignedToInchargeName"]?.toString(),
                internalAdminNotes = data["internalAdminNotes"]?.toString(),
                createdAt = createdAtVal
            )
        } catch (_: Exception) {
            null
        }
    }

    private fun mergeComplaints(existing: List<FeedbackComplaint>, incoming: List<FeedbackComplaint>): List<FeedbackComplaint> {
        val map = linkedMapOf<String, FeedbackComplaint>()
        for (item in existing) {
            if (item.id.isNotBlank()) map[item.id] = item
        }
        for (item in incoming) {
            if (item.id.isNotBlank()) map[item.id] = item
        }
        return map.values.sortedByDescending { it.createdAt }
    }

    private fun saveComplaintsToCache(list: List<FeedbackComplaint>) {
        val p = prefs ?: return
        runCatching {
            val jsonArray = JSONArray()
            for (c in list) {
                val obj = JSONObject().apply {
                    put("id", c.id)
                    put("studentId", c.studentId)
                    put("studentName", c.studentName)
                    put("messId", c.messId)
                    put("category", c.category.name)
                    c.mealType?.let { put("mealType", it.name) }
                    put("date", c.date)
                    put("description", c.description)
                    c.photoUrl?.let { put("photoUrl", it) }
                    c.latitude?.let { put("latitude", it) }
                    c.longitude?.let { put("longitude", it) }
                    c.gpsLocationTag?.let { put("gpsLocationTag", it) }
                    put("isPrivate", c.isPrivate)
                    put("reportedToAdmin", c.reportedToAdmin)
                    put("reportedToIncharge", c.reportedToIncharge)
                    put("status", c.status.name)
                    c.officialResponse?.let { put("officialResponse", it) }
                    c.respondedBy?.let { put("respondedBy", it) }
                    c.respondedAt?.let { put("respondedAt", it) }
                    c.assignedToInchargeId?.let { put("assignedToInchargeId", it) }
                    c.assignedToInchargeName?.let { put("assignedToInchargeName", it) }
                    c.internalAdminNotes?.let { put("internalAdminNotes", it) }
                    put("createdAt", c.createdAt)
                }
                jsonArray.put(obj)
            }
            p.edit().putString("cached_complaints", jsonArray.toString()).apply()
        }
    }

    private fun loadCachedComplaints() {
        val p = prefs ?: return
        runCatching {
            val raw = p.getString("cached_complaints", null) ?: return
            val jsonArray = JSONArray(raw)
            val list = mutableListOf<FeedbackComplaint>()
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                val category = runCatching { FeedbackCategory.valueOf(obj.getString("category")) }.getOrDefault(FeedbackCategory.FOOD_QUALITY)
                val mealType = if (obj.has("mealType")) runCatching { MealType.valueOf(obj.getString("mealType")) }.getOrNull() else null
                val status = runCatching { ComplaintStatus.valueOf(obj.getString("status")) }.getOrDefault(ComplaintStatus.SUBMITTED)

                list.add(
                    FeedbackComplaint(
                        id = obj.optString("id", UUID.randomUUID().toString()),
                        studentId = obj.optString("studentId", ""),
                        studentName = obj.optString("studentName", ""),
                        messId = obj.optString("messId", "MESS_001"),
                        category = category,
                        mealType = mealType,
                        date = obj.optString("date", ""),
                        description = obj.optString("description", ""),
                        photoUrl = if (obj.has("photoUrl")) obj.optString("photoUrl") else null,
                        latitude = if (obj.has("latitude")) obj.optDouble("latitude") else null,
                        longitude = if (obj.has("longitude")) obj.optDouble("longitude") else null,
                        gpsLocationTag = if (obj.has("gpsLocationTag")) obj.optString("gpsLocationTag") else null,
                        isPrivate = obj.optBoolean("isPrivate", false),
                        reportedToAdmin = obj.optBoolean("reportedToAdmin", true),
                        reportedToIncharge = obj.optBoolean("reportedToIncharge", true),
                        status = status,
                        officialResponse = if (obj.has("officialResponse")) obj.optString("officialResponse") else null,
                        respondedBy = if (obj.has("respondedBy")) obj.optString("respondedBy") else null,
                        respondedAt = if (obj.has("respondedAt")) obj.optLong("respondedAt") else null,
                        assignedToInchargeId = if (obj.has("assignedToInchargeId")) obj.optString("assignedToInchargeId") else null,
                        assignedToInchargeName = if (obj.has("assignedToInchargeName")) obj.optString("assignedToInchargeName") else null,
                        internalAdminNotes = if (obj.has("internalAdminNotes")) obj.optString("internalAdminNotes") else null,
                        createdAt = obj.optLong("createdAt", System.currentTimeMillis())
                    )
                )
            }
            if (list.isNotEmpty()) {
                _complaints.value = list.sortedByDescending { it.createdAt }

                // Automatically push cached offline complaints to Firebase Realtime Database
                runCatching {
                    val feedbackRef = rtdb?.getReference("feedback")
                    for (c in list) {
                        if (c.id.isNotBlank()) {
                            val mapData = hashMapOf<String, Any?>(
                                "id" to c.id,
                                "studentId" to c.studentId,
                                "studentName" to c.studentName,
                                "messId" to c.messId,
                                "category" to c.category.name,
                                "mealType" to c.mealType?.name,
                                "date" to c.date,
                                "description" to c.description,
                                "photoUrl" to c.photoUrl,
                                "latitude" to c.latitude,
                                "longitude" to c.longitude,
                                "gpsLocationTag" to c.gpsLocationTag,
                                "isPrivate" to c.isPrivate,
                                "reportedToAdmin" to c.reportedToAdmin,
                                "reportedToIncharge" to c.reportedToIncharge,
                                "status" to c.status.name,
                                "officialResponse" to c.officialResponse,
                                "respondedBy" to c.respondedBy,
                                "respondedAt" to c.respondedAt,
                                "assignedToInchargeId" to c.assignedToInchargeId,
                                "assignedToInchargeName" to c.assignedToInchargeName,
                                "internalAdminNotes" to c.internalAdminNotes,
                                "createdAt" to c.createdAt
                            )
                            feedbackRef?.child(c.id)?.updateChildren(mapData.filterValues { it != null } as Map<String, Any>)
                        }
                    }
                }
            }
        }
    }

    fun submitFeedback(
        studentId: String,
        studentName: String,
        messId: String = "MESS_001",
        category: FeedbackCategory,
        mealType: MealType?,
        date: String,
        description: String,
        photoUrl: String? = null,
        latitude: Double? = null,
        longitude: Double? = null,
        gpsLocationTag: String? = null,
        isPrivate: Boolean = false,
        reportedToAdmin: Boolean = true,
        reportedToIncharge: Boolean = true
    ): FeedbackComplaint {
        val complaintId = "COMP_" + UUID.randomUUID().toString().take(6).uppercase()
        val complaint = FeedbackComplaint(
            id = complaintId,
            studentId = studentId,
            studentName = studentName,
            messId = messId,
            category = category,
            mealType = mealType,
            date = date,
            description = description,
            photoUrl = photoUrl,
            latitude = latitude,
            longitude = longitude,
            gpsLocationTag = gpsLocationTag,
            isPrivate = isPrivate,
            reportedToAdmin = reportedToAdmin,
            reportedToIncharge = reportedToIncharge,
            status = ComplaintStatus.SUBMITTED,
            createdAt = System.currentTimeMillis()
        )

        val mapData = hashMapOf<String, Any?>(
            "id" to complaintId,
            "studentId" to studentId,
            "studentName" to studentName,
            "messId" to messId,
            "category" to category.name,
            "mealType" to mealType?.name,
            "date" to date,
            "description" to description,
            "photoUrl" to photoUrl,
            "latitude" to latitude,
            "longitude" to longitude,
            "gpsLocationTag" to gpsLocationTag,
            "isPrivate" to isPrivate,
            "reportedToAdmin" to reportedToAdmin,
            "reportedToIncharge" to reportedToIncharge,
            "status" to ComplaintStatus.SUBMITTED.name,
            "createdAt" to complaint.createdAt
        )

        // 1. Broadcast immediately to Firebase Realtime Database
        runCatching {
            rtdb?.getReference("feedback")?.child(complaintId)?.setValue(mapData)
        }

        // 2. Also write to Cloud Firestore as fallback
        runCatching {
            firestore?.collection("feedback")?.document(complaintId)?.set(mapData)
        }

        val list = _complaints.value.toMutableList()
        list.removeAll { it.id == complaintId }
        list.add(0, complaint)
        _complaints.value = list
        saveComplaintsToCache(list)
        return complaint
    }

    fun respondToComplaint(
        complaintId: String,
        status: ComplaintStatus,
        responseMessage: String,
        responderName: String = "Mess Incharge",
        assignedInchargeId: String? = null,
        assignedInchargeName: String? = null
    ) {
        val list = _complaints.value.toMutableList()
        val index = list.indexOfFirst { it.id == complaintId }
        if (index != -1) {
            val old = list[index]
            val updated = old.copy(
                status = status,
                officialResponse = responseMessage,
                respondedBy = responderName,
                respondedAt = System.currentTimeMillis(),
                assignedToInchargeId = assignedInchargeId ?: old.assignedToInchargeId,
                assignedToInchargeName = assignedInchargeName ?: old.assignedToInchargeName
            )

            val updateMap = mapOf<String, Any?>(
                "status" to status.name,
                "officialResponse" to responseMessage,
                "respondedBy" to responderName,
                "respondedAt" to updated.respondedAt,
                "assignedToInchargeId" to (assignedInchargeId ?: old.assignedToInchargeId),
                "assignedToInchargeName" to (assignedInchargeName ?: old.assignedToInchargeName)
            )

            // 1. Sync update to Realtime Database
            runCatching {
                rtdb?.getReference("feedback")?.child(complaintId)?.updateChildren(updateMap)
            }

            // 2. Also write to Cloud Firestore as fallback
            runCatching {
                firestore?.collection("feedback")?.document(complaintId)?.update(updateMap)
            }

            list[index] = updated
            _complaints.value = list
            saveComplaintsToCache(list)
        }
    }

    fun getStudentComplaints(studentId: String): List<FeedbackComplaint> {
        return _complaints.value.filter { it.studentId == studentId }
    }

    fun getComplaintsForMess(messId: String): List<FeedbackComplaint> {
        return _complaints.value.filter { messId.isBlank() || it.messId.isBlank() || it.messId == messId }
    }
}
