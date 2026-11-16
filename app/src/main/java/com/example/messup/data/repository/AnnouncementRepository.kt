package com.example.messup.data.repository

import com.example.messup.data.model.Announcement
import com.example.messup.data.model.NoticePriority
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

class AnnouncementRepository {

    private val rtdb: FirebaseDatabase? by lazy {
        runCatching {
            FirebaseDatabase.getInstance("https://messup-ee9fc-default-rtdb.firebaseio.com")
        }.getOrNull()
    }

    private val firestore: FirebaseFirestore? by lazy {
        runCatching { FirebaseFirestore.getInstance() }.getOrNull()
    }

    private val _announcements = MutableStateFlow<List<Announcement>>(emptyList())
    val announcements: StateFlow<List<Announcement>> = _announcements.asStateFlow()

    init {
        // 1. Real-time Firebase Realtime Database Listener
        rtdb?.getReference("announcements")?.addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                runCatching {
                    val items = mutableListOf<Announcement>()
                    for (child in snapshot.children) {
                        val rawMap = child.value as? Map<*, *> ?: continue
                        val map = rawMap.entries.associate { (k, v) -> k.toString() to (v ?: "") }
                        parseAnnouncementManually(child.key ?: "", map)?.let { items.add(it) }
                    }
                    _announcements.value = items.sortedByDescending { it.createdAt }
                }
            }
            override fun onCancelled(error: DatabaseError) {}
        })

        // 2. Fallback Cloud Firestore Listener for Announcements (Admin <-> Student <-> Incharge sync)
        firestore?.collection("announcements")?.addSnapshotListener { snapshot, error ->
            if (error != null || snapshot == null) return@addSnapshotListener
            runCatching {
                val items = snapshot.documents.mapNotNull { doc ->
                    doc.toObject(Announcement::class.java)?.copy(id = doc.id)
                }
                if (items.isNotEmpty()) {
                    _announcements.value = items.sortedByDescending { it.createdAt }
                }
            }
        }
    }

    private fun parseAnnouncementManually(annId: String, data: Map<String, Any?>): Announcement? {
        return try {
            val priorityStr = data["priority"]?.toString() ?: NoticePriority.NORMAL.name
            val priority = runCatching { NoticePriority.valueOf(priorityStr) }.getOrDefault(NoticePriority.NORMAL)
            val createdAtVal = when (val c = data["createdAt"]) {
                is Number -> c.toLong()
                is String -> c.toLongOrNull() ?: System.currentTimeMillis()
                else -> System.currentTimeMillis()
            }

            Announcement(
                id = annId,
                messId = data["messId"]?.toString() ?: "MESS_001",
                title = data["title"]?.toString() ?: "",
                content = data["content"]?.toString() ?: "",
                priority = priority,
                createdBy = data["createdBy"]?.toString() ?: "",
                createdByName = data["createdByName"]?.toString() ?: "",
                targetRole = data["targetRole"]?.toString(),
                createdAt = createdAtVal
            )
        } catch (_: Exception) {
            null
        }
    }

    fun postAnnouncement(
        title: String,
        content: String,
        priority: NoticePriority = NoticePriority.NORMAL,
        createdByName: String = "Mess Incharge",
        messId: String = "MESS_001",
        createdBy: String = "",
        targetRole: String? = null
    ): Announcement {
        val effectiveMessId = if (messId.isNotBlank()) messId else "MESS_001"
        val newAnnouncement = Announcement(
            id = "ANN_" + UUID.randomUUID().toString().take(6).uppercase(),
            messId = effectiveMessId,
            title = title,
            content = content,
            priority = priority,
            createdBy = createdBy,
            createdByName = createdByName,
            targetRole = targetRole,
            createdAt = System.currentTimeMillis()
        )
        val list = _announcements.value.toMutableList()
        list.add(0, newAnnouncement)
        _announcements.value = list

        // 1. Sync to Firebase Realtime Database
        val annPayload = mapOf<String, Any?>(
            "id" to newAnnouncement.id,
            "messId" to effectiveMessId,
            "title" to title,
            "content" to content,
            "priority" to priority.name,
            "createdBy" to createdBy,
            "createdByName" to createdByName,
            "targetRole" to targetRole,
            "createdAt" to newAnnouncement.createdAt
        )
        runCatching {
            rtdb?.getReference("announcements")?.child(newAnnouncement.id)?.setValue(annPayload)
        }

        // 2. Sync to Cloud Firestore fallback for Admin and Students
        runCatching {
            firestore?.collection("announcements")?.document(newAnnouncement.id)?.set(annPayload)
        }

        return newAnnouncement
    }
}
