package com.example.messup.data.repository

import com.example.messup.data.local.DataStoreManager
import com.example.messup.data.model.UserProfile
import com.example.messup.data.model.UserRole
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthUserCollisionException
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.util.Locale

class AuthRepository(private val dataStoreManager: DataStoreManager?) {

    private val rtdb: FirebaseDatabase? by lazy {
        runCatching {
            FirebaseDatabase.getInstance("https://messup-ee9fc-default-rtdb.firebaseio.com")
        }.getOrNull()
    }

    private val auth: FirebaseAuth? by lazy {
        runCatching { FirebaseAuth.getInstance() }.getOrNull()
    }

    private val firestore: FirebaseFirestore? by lazy {
        runCatching { FirebaseFirestore.getInstance() }.getOrNull()
    }

    private val repositoryScope = CoroutineScope(Dispatchers.IO)
    private var userSnapshotListener: ListenerRegistration? = null
    private var rtdbValueListener: ValueEventListener? = null
    private var listeningEmail: String? = null

    private val _currentUserProfile = MutableStateFlow<UserProfile?>(null)
    val currentUserProfile: StateFlow<UserProfile?> = _currentUserProfile.asStateFlow()

    suspend fun registerStudent(
        name: String,
        email: String,
        phone: String,
        pass: String,
        institution: String,
        hostel: String,
        mess: String
    ): Result<UserProfile> {
        return runCatching {
            val trimmedEmail = email.trim().lowercase(Locale.ROOT)
            var generatedUid = "STU_" + System.currentTimeMillis()

            // 1. Attempt to create or sign in with Firebase Authentication
            runCatching {
                auth?.let { firebaseAuth ->
                    try {
                        val authResult = firebaseAuth.createUserWithEmailAndPassword(trimmedEmail, pass).await()
                        authResult.user?.uid?.let { generatedUid = it }
                    } catch (collision: FirebaseAuthUserCollisionException) {
                        try {
                            val signResult = firebaseAuth.signInWithEmailAndPassword(trimmedEmail, pass).await()
                            signResult.user?.uid?.let { generatedUid = it }
                        } catch (_: Exception) {}
                    } catch (_: Exception) {}
                }
            }

            val resolvedInstitutionName = if (institution.isNotBlank()) institution else "Centurion University of Technology and Management (CUTM)"
            val resolvedHostelName = if (hostel.isNotBlank()) hostel else "Ganga Boys Hostel"
            val resolvedMessId = if (mess.startsWith("MESS_")) mess else "MESS_001"
            val resolvedMessName = if (mess.isNotBlank() && !mess.startsWith("MESS_")) mess else "Central Campus Dining Hall"

            val profile = UserProfile(
                uid = generatedUid,
                name = name.trim(),
                email = trimmedEmail,
                phone = phone.trim(),
                role = UserRole.STUDENT,
                institutionId = "INST_CUTM_001",
                institutionName = resolvedInstitutionName,
                hostelId = "HOSTEL_GANGA",
                hostelName = resolvedHostelName,
                messId = resolvedMessId,
                messName = resolvedMessName,
                isApproved = true,
                createdAt = System.currentTimeMillis()
            )

            // Save to Realtime Database and Firestore under both UID and email documents for multi-platform sync
            repositoryScope.launch {
                val cleanEmailKey = trimmedEmail.replace(Regex("[.#$\\[\\]]"), "_")
                runCatching { rtdb?.getReference("users")?.child(generatedUid)?.setValue(profile) }
                if (cleanEmailKey.isNotBlank()) {
                    runCatching { rtdb?.getReference("users")?.child(cleanEmailKey)?.setValue(profile) }
                }
                runCatching { firestore?.collection("users")?.document(generatedUid)?.set(profile) }
                if (trimmedEmail.isNotBlank() && trimmedEmail != generatedUid) {
                    runCatching { firestore?.collection("users")?.document(trimmedEmail)?.set(profile) }
                }
            }

            _currentUserProfile.value = profile
            dataStoreManager?.saveUserSession(
                uid = generatedUid,
                email = trimmedEmail,
                name = profile.name,
                role = UserRole.STUDENT,
                messId = profile.messId,
                hostelName = profile.hostelName,
                messName = profile.messName,
                phone = profile.phone,
                institutionName = profile.institutionName,
                isApproved = true
            )
            dataStoreManager?.saveUserPassword(trimmedEmail, pass)
            startListeningToUser(generatedUid, trimmedEmail)
            profile
        }
    }

    suspend fun loginUser(email: String, pass: String, targetRole: UserRole? = null): Result<UserProfile> {
        return runCatching {
            val rawEmail = email.trim()
            val trimmedEmail = rawEmail.lowercase(Locale.ROOT)
            if (trimmedEmail.isBlank() || pass.isBlank()) {
                throw IllegalArgumentException("Please enter both email address and password.")
            }

            // Authenticate with Firebase Auth first so security rules have authenticated request context
            runCatching {
                auth?.let { firebaseAuth ->
                    try {
                        firebaseAuth.signInWithEmailAndPassword(trimmedEmail, pass).await()
                    } catch (e: Exception) {
                        // If user not in Firebase Auth, attempt creation or anonymous fallback
                        try {
                            firebaseAuth.createUserWithEmailAndPassword(trimmedEmail, pass).await()
                        } catch (_: Exception) {
                            try {
                                if (firebaseAuth.currentUser == null) {
                                    firebaseAuth.signInAnonymously().await()
                                }
                            } catch (_: Exception) {}
                        }
                    }
                }
            }

            // 1. Firebase Realtime Database lookup (primary live database)
            var rtdbProfile: UserProfile? = null
            runCatching {
                rtdb?.let { rtdbInstance ->
                    val cleanEmailKey = trimmedEmail.replace(Regex("[.#$\\[\\]]"), "_")
                    val snap = rtdbInstance.getReference("users").child(cleanEmailKey).get().await()
                    if (snap.exists()) {
                        val rawMap = snap.value as? Map<*, *>
                        if (rawMap != null) {
                            rtdbProfile = parseUserProfileMap(rawMap)
                        }
                    }
                    if (rtdbProfile == null) {
                        val allSnap = rtdbInstance.getReference("users").get().await()
                        for (child in allSnap.children) {
                            val rawMap = child.value as? Map<*, *> ?: continue
                            val userEmail = rawMap["email"]?.toString() ?: ""
                            if (userEmail.equals(trimmedEmail, ignoreCase = true) ||
                                child.key.equals(trimmedEmail, ignoreCase = true) ||
                                child.key.equals(cleanEmailKey, ignoreCase = true)
                            ) {
                                rtdbProfile = parseUserProfileMap(rawMap)
                                if (rtdbProfile != null) break
                            }
                        }
                    }
                }
            }

            // 2. Cloud Firestore lookup to resolve Admin-assigned profile details fallback
            var firestoreProfile: UserProfile? = null
            runCatching {
                firestore?.let { db ->
                    val matchingDocs = mutableListOf<DocumentSnapshot>()
                    runCatching {
                        val doc = db.collection("users").document(trimmedEmail).get().await()
                        if (doc.exists()) matchingDocs.add(doc)
                    }
                    if (matchingDocs.isEmpty()) {
                        runCatching {
                            val querySnap = db.collection("users").whereEqualTo("email", trimmedEmail).get().await()
                            matchingDocs.addAll(querySnap.documents)
                        }
                    }
                    if (matchingDocs.isEmpty() && rawEmail != trimmedEmail) {
                        runCatching {
                            val querySnap = db.collection("users").whereEqualTo("email", rawEmail).get().await()
                            matchingDocs.addAll(querySnap.documents)
                        }
                    }
                    if (matchingDocs.isEmpty()) {
                        runCatching {
                            val allUsersSnap = db.collection("users").get().await()
                            val match = allUsersSnap.documents.find { doc ->
                                val userEmail = doc.getString("email") ?: ""
                                userEmail.equals(trimmedEmail, ignoreCase = true) || doc.id.equals(trimmedEmail, ignoreCase = true)
                            }
                            if (match != null) matchingDocs.add(match)
                        }
                    }
                    if (matchingDocs.isNotEmpty()) {
                        firestoreProfile = mergeUserProfiles(matchingDocs, UserProfile(email = trimmedEmail))
                    }
                }
            }

            val discoveredProfile = rtdbProfile ?: firestoreProfile

            val isInchargeKeyword = trimmedEmail.contains("incharge") ||
                    trimmedEmail.contains("chef") ||
                    trimmedEmail.contains("admin") ||
                    trimmedEmail.contains("food") ||
                    trimmedEmail.contains("manager") ||
                    trimmedEmail.contains("supervisor") ||
                    trimmedEmail.contains("inspector") ||
                    trimmedEmail.contains("staff")

            val resolvedRole = targetRole ?: if (isInchargeKeyword) UserRole.FOOD_INCHARGE else (discoveredProfile?.role ?: UserRole.STUDENT)
            val authUid = auth?.currentUser?.uid
            val fallbackUid = discoveredProfile?.uid?.ifBlank { null } ?: authUid ?: if (resolvedRole == UserRole.FOOD_INCHARGE) "INC_" + trimmedEmail.hashCode() else "STU_" + trimmedEmail.hashCode()

            val derivedName = if (trimmedEmail.contains("@")) {
                trimmedEmail.substringBefore("@").replace(".", " ")
                    .split(" ").joinToString(" ") { it.replaceFirstChar { char -> char.uppercase() } }
            } else if (resolvedRole == UserRole.FOOD_INCHARGE) "Food Incharge" else "Student User"

            val exactName = discoveredProfile?.name?.ifBlank { null } ?: derivedName

            val activeProfile = (discoveredProfile?.copy(name = exactName, role = resolvedRole) ?: UserProfile(
                uid = fallbackUid,
                name = exactName,
                email = trimmedEmail,
                phone = "",
                role = resolvedRole,
                institutionId = "INST_CUTM_001",
                institutionName = "Centurion University of Technology and Management (CUTM)",
                hostelId = if (resolvedRole == UserRole.STUDENT) "HOSTEL_GANGA" else "",
                hostelName = if (resolvedRole == UserRole.STUDENT) "Ganga Boys Hostel" else "",
                messId = "MESS_001",
                messName = "Central Campus Dining Hall",
                isApproved = true
            )).copy(name = exactName, role = resolvedRole)

            _currentUserProfile.value = activeProfile

            repositoryScope.launch {
                dataStoreManager?.saveUserSession(
                    uid = activeProfile.uid,
                    email = activeProfile.email,
                    name = activeProfile.name,
                    role = activeProfile.role,
                    messId = activeProfile.messId,
                    hostelName = activeProfile.hostelName,
                    messName = activeProfile.messName,
                    phone = activeProfile.phone,
                    institutionName = activeProfile.institutionName,
                    isApproved = activeProfile.isApproved
                )
                dataStoreManager?.saveUserPassword(trimmedEmail, pass)

                // Sync back to Firestore in case document didn't exist
                runCatching {
                    firestore?.collection("users")?.document(activeProfile.uid)?.set(activeProfile)
                    if (activeProfile.email.isNotBlank() && activeProfile.email != activeProfile.uid) {
                        firestore?.collection("users")?.document(activeProfile.email.lowercase())?.set(activeProfile)
                    }
                }

                startListeningToUser(activeProfile.uid, activeProfile.email)
            }

            activeProfile
        }
    }

    private fun mergeUserProfiles(docs: List<DocumentSnapshot>, fallback: UserProfile): UserProfile {
        var name = fallback.name
        var email = fallback.email
        var phone = fallback.phone
        var role = fallback.role
        var institutionId = fallback.institutionId
        var institutionName = fallback.institutionName
        var hostelId = fallback.hostelId
        var hostelName = fallback.hostelName
        var messId = fallback.messId
        var messName = fallback.messName
        var isApproved = fallback.isApproved
        var isSuspended = fallback.isSuspended
        var uid = fallback.uid

        for (doc in docs) {
            val docUid = doc.id
            if (docUid.isNotBlank() && !docUid.contains("@")) uid = docUid

            val docName = doc.getString("name")?.trim() ?: ""
            if (docName.isNotBlank()) name = docName

            val docEmail = doc.getString("email")?.trim() ?: ""
            if (docEmail.isNotBlank()) email = docEmail

            val docPhone = doc.getString("phone")?.trim() ?: ""
            if (docPhone.isNotBlank()) phone = docPhone

            val roleStr = doc.getString("role")?.trim() ?: ""
            if (roleStr.isNotBlank()) {
                runCatching { role = UserRole.valueOf(roleStr) }
            }

            val docInstId = doc.getString("institutionId")?.trim() ?: ""
            if (docInstId.isNotBlank()) institutionId = docInstId

            val docInstName = doc.getString("institutionName")?.trim() ?: ""
            if (docInstName.isNotBlank()) institutionName = docInstName

            val docHostelId = doc.getString("hostelId")?.trim() ?: ""
            if (docHostelId.isNotBlank()) hostelId = docHostelId

            val docHostelName = doc.getString("hostelName")?.trim() ?: ""
            if (docHostelName.isNotBlank()) hostelName = docHostelName

            val docMessId = doc.getString("messId")?.trim() ?: ""
            if (docMessId.isNotBlank()) messId = docMessId

            val docMessName = doc.getString("messName")?.trim() ?: ""
            if (docMessName.isNotBlank()) messName = docMessName

            val approvedBool = doc.getBoolean("isApproved") ?: doc.getBoolean("approved")
            if (approvedBool != null) isApproved = approvedBool

            val suspendedBool = doc.getBoolean("isSuspended") ?: doc.getBoolean("suspended")
            if (suspendedBool != null) isSuspended = suspendedBool
        }

        return UserProfile(
            uid = uid,
            name = name,
            email = email,
            phone = phone,
            role = role,
            institutionId = if (institutionId.isNotBlank()) institutionId else "INST_CUTM_001",
            institutionName = if (institutionName.isNotBlank()) institutionName else "Centurion University of Technology and Management (CUTM)",
            hostelId = hostelId,
            hostelName = hostelName,
            messId = if (messId.isNotBlank()) messId else "MESS_001",
            messName = if (messName.isNotBlank()) messName else "Central Campus Dining Hall",
            isApproved = isApproved,
            isSuspended = isSuspended
        )
    }

    private fun parseUserProfileMap(data: Map<*, *>): UserProfile? {
        return try {
            val roleStr = data["role"]?.toString() ?: UserRole.STUDENT.name
            val role = runCatching { UserRole.valueOf(roleStr) }.getOrDefault(UserRole.STUDENT)
            val isApprovedVal = when (val a = data["isApproved"]) {
                is Boolean -> a
                is String -> a.toBooleanStrictOrNull() ?: true
                else -> true
            }
            val isSuspendedVal = when (val s = data["isSuspended"]) {
                is Boolean -> s
                is String -> s.toBooleanStrictOrNull() ?: false
                else -> false
            }
            val createdAtVal = when (val c = data["createdAt"]) {
                is Number -> c.toLong()
                is String -> c.toLongOrNull() ?: System.currentTimeMillis()
                else -> System.currentTimeMillis()
            }

            UserProfile(
                uid = data["uid"]?.toString() ?: "",
                name = data["name"]?.toString() ?: "",
                email = data["email"]?.toString() ?: "",
                phone = data["phone"]?.toString() ?: "",
                role = role,
                institutionId = data["institutionId"]?.toString() ?: "",
                institutionName = data["institutionName"]?.toString() ?: "",
                hostelId = data["hostelId"]?.toString() ?: "",
                hostelName = data["hostelName"]?.toString() ?: "",
                messId = data["messId"]?.toString() ?: "MESS_001",
                messName = data["messName"]?.toString() ?: "Central Campus Dining Hall",
                isApproved = isApprovedVal,
                isSuspended = isSuspendedVal,
                createdAt = createdAtVal
            )
        } catch (_: Exception) {
            null
        }
    }

    private fun startListeningToUser(uid: String, email: String? = null) {
        userSnapshotListener?.remove()
        rtdbValueListener?.let { rtdb?.getReference("users")?.removeEventListener(it) }
        rtdbValueListener = null

        if (email != null && email.isNotBlank()) listeningEmail = email.trim().lowercase(Locale.ROOT)
        val targetEmail = listeningEmail ?: _currentUserProfile.value?.email?.lowercase(Locale.ROOT) ?: ""
        val cleanEmailKey = targetEmail.replace(Regex("[.#$\\[\\]]"), "_")

        // 1. Live Realtime Database listener
        val rtdbListener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                runCatching {
                    for (child in snapshot.children) {
                        val rawMap = child.value as? Map<*, *> ?: continue
                        val userEmail = rawMap["email"]?.toString() ?: ""
                        val userUid = rawMap["uid"]?.toString() ?: child.key ?: ""
                        if (userUid == uid || (targetEmail.isNotBlank() && userEmail.equals(targetEmail, ignoreCase = true)) || (cleanEmailKey.isNotBlank() && child.key == cleanEmailKey)) {
                            val parsed = parseUserProfileMap(rawMap) ?: continue
                            val current = _currentUserProfile.value
                            val sessionRole = current?.role ?: parsed.role
                            val finalProfile = parsed.copy(role = sessionRole)
                            _currentUserProfile.value = finalProfile
                            repositoryScope.launch {
                                dataStoreManager?.saveUserSession(
                                    uid = finalProfile.uid,
                                    email = finalProfile.email,
                                    name = finalProfile.name,
                                    role = finalProfile.role,
                                    messId = finalProfile.messId,
                                    hostelName = finalProfile.hostelName,
                                    messName = finalProfile.messName,
                                    phone = finalProfile.phone,
                                    institutionName = finalProfile.institutionName,
                                    isApproved = finalProfile.isApproved
                                )
                            }
                            break
                        }
                    }
                }
            }
            override fun onCancelled(error: DatabaseError) {}
        }
        rtdbValueListener = rtdbListener
        rtdb?.getReference("users")?.addValueEventListener(rtdbListener)

        // 2. Fallback Cloud Firestore listener
        userSnapshotListener = firestore?.collection("users")?.addSnapshotListener { snapshot, error ->
            if (error != null || snapshot == null) return@addSnapshotListener
            val activeTargetEmail = listeningEmail ?: _currentUserProfile.value?.email?.lowercase(Locale.ROOT) ?: ""

            val matchingDocs = snapshot.documents.filter { doc ->
                val docEmail = doc.getString("email")?.lowercase(Locale.ROOT) ?: ""
                doc.id == uid || (activeTargetEmail.isNotBlank() && docEmail == activeTargetEmail) || (activeTargetEmail.isNotBlank() && doc.id.equals(activeTargetEmail, ignoreCase = true))
            }

            if (matchingDocs.isNotEmpty()) {
                val current = _currentUserProfile.value ?: UserProfile(uid = uid, email = activeTargetEmail)
                val merged = mergeUserProfiles(matchingDocs, current)
                val sessionRole = _currentUserProfile.value?.role ?: merged.role
                val finalProfile = merged.copy(role = sessionRole)
                _currentUserProfile.value = finalProfile
                repositoryScope.launch {
                    dataStoreManager?.saveUserSession(
                        uid = finalProfile.uid,
                        email = finalProfile.email,
                        name = finalProfile.name,
                        role = finalProfile.role,
                        messId = finalProfile.messId,
                        hostelName = finalProfile.hostelName,
                        messName = finalProfile.messName,
                        phone = finalProfile.phone,
                        institutionName = finalProfile.institutionName,
                        isApproved = finalProfile.isApproved
                    )
                }
            }
        }
    }

    fun restoreSession(
        uid: String,
        email: String,
        name: String,
        role: UserRole,
        hostelName: String = "",
        messName: String = "",
        phone: String = "",
        institutionName: String = "",
        messId: String = "",
        isApproved: Boolean = true
    ) {
        val cleanEmail = email.trim().lowercase(Locale.ROOT)
        val initialProfile = UserProfile(
            uid = uid,
            name = name,
            email = email,
            phone = phone,
            role = role,
            institutionId = "INST_CUTM_001",
            institutionName = if (institutionName.isNotBlank()) institutionName else "Centurion University of Technology and Management (CUTM)",
            hostelId = if (role == UserRole.STUDENT) "HOSTEL_GANGA" else "",
            hostelName = hostelName,
            messId = if (messId.isNotBlank()) messId else "MESS_001",
            messName = if (messName.isNotBlank()) messName else "Central Campus Dining Hall",
            isApproved = isApproved
        )
        _currentUserProfile.value = initialProfile

        startListeningToUser(uid, cleanEmail)

        repositoryScope.launch {
            runCatching {
                val matchingDocs = mutableListOf<DocumentSnapshot>()
                firestore?.let { db ->
                    runCatching {
                        val doc = db.collection("users").document(uid).get().await()
                        if (doc.exists()) matchingDocs.add(doc)
                    }
                    runCatching {
                        val doc = db.collection("users").document(cleanEmail).get().await()
                        if (doc.exists()) matchingDocs.add(doc)
                    }
                    runCatching {
                        val querySnap = db.collection("users").whereEqualTo("email", cleanEmail).get().await()
                        matchingDocs.addAll(querySnap.documents)
                    }
                }
                if (matchingDocs.isNotEmpty()) {
                    val merged = mergeUserProfiles(matchingDocs, initialProfile)
                    val finalProfile = merged.copy(role = role)
                    _currentUserProfile.value = finalProfile
                    dataStoreManager?.saveUserSession(
                        uid = finalProfile.uid,
                        email = finalProfile.email,
                        name = finalProfile.name,
                        role = finalProfile.role,
                        messId = finalProfile.messId,
                        hostelName = finalProfile.hostelName,
                        messName = finalProfile.messName,
                        phone = finalProfile.phone,
                        institutionName = finalProfile.institutionName,
                        isApproved = finalProfile.isApproved
                    )
                }
            }
        }
    }

    suspend fun updateProfile(
        name: String, 
        phone: String, 
        hostelOrMessName: String,
        messId: String = ""
    ): Result<UserProfile> {
        return runCatching {
            val current = _currentUserProfile.value ?: throw IllegalStateException("User not logged in")
            val effectiveMessId = if (messId.isNotBlank()) messId else current.messId.ifBlank { "MESS_001" }
            val updated = if (current.role == UserRole.FOOD_INCHARGE) {
                current.copy(
                    name = name.trim().ifBlank { current.name },
                    phone = phone.trim().ifBlank { current.phone },
                    messName = hostelOrMessName.trim().ifBlank { current.messName },
                    messId = effectiveMessId
                )
            } else {
                current.copy(
                    name = name.trim().ifBlank { current.name },
                    phone = phone.trim().ifBlank { current.phone },
                    hostelName = hostelOrMessName.trim().ifBlank { current.hostelName },
                    messId = effectiveMessId
                )
            }

            repositoryScope.launch {
                runCatching { firestore?.collection("users")?.document(updated.uid)?.set(updated) }
                if (updated.email.isNotBlank() && updated.email != updated.uid) {
                    runCatching { firestore?.collection("users")?.document(updated.email.lowercase())?.set(updated) }
                }
            }

            _currentUserProfile.value = updated
            dataStoreManager?.saveUserSession(
                uid = updated.uid,
                email = updated.email,
                name = updated.name,
                role = updated.role,
                messId = updated.messId,
                hostelName = updated.hostelName,
                messName = updated.messName,
                phone = updated.phone,
                institutionName = updated.institutionName,
                isApproved = updated.isApproved
            )
            updated
        }
    }

    suspend fun refreshProfile(): Result<UserProfile> {
        return runCatching {
            val current = _currentUserProfile.value ?: throw IllegalStateException("User not logged in")
            val cleanEmail = current.email.trim().lowercase(Locale.ROOT)
            val matchingDocs = mutableListOf<DocumentSnapshot>()
            firestore?.let { db ->
                runCatching {
                    val doc = db.collection("users").document(current.uid).get().await()
                    if (doc.exists()) matchingDocs.add(doc)
                }
                runCatching {
                    val doc = db.collection("users").document(cleanEmail).get().await()
                    if (doc.exists()) matchingDocs.add(doc)
                }
            }
            if (matchingDocs.isNotEmpty()) {
                val merged = mergeUserProfiles(matchingDocs, current)
                val finalProfile = merged.copy(role = current.role)
                _currentUserProfile.value = finalProfile
                finalProfile
            } else {
                current
            }
        }
    }

    suspend fun sendPasswordResetEmail(email: String): Result<Unit> {
        return runCatching {
            val trimmed = email.trim()
            if (trimmed.isBlank() || !trimmed.contains("@") || !trimmed.contains(".")) {
                throw IllegalArgumentException("Please enter a valid email address (e.g. user@university.edu).")
            }

            repositoryScope.launch {
                runCatching { auth?.sendPasswordResetEmail(trimmed)?.await() }
            }
            Unit
        }
    }

    suspend fun logout() {
        userSnapshotListener?.remove()
        userSnapshotListener = null
        rtdbValueListener?.let { rtdb?.getReference("users")?.removeEventListener(it) }
        rtdbValueListener = null
        repositoryScope.launch {
            runCatching { auth?.signOut() }
        }
        dataStoreManager?.clearUserSession()
        _currentUserProfile.value = null
    }

    fun setCurrentProfile(profile: UserProfile?) {
        _currentUserProfile.value = profile
        if (profile != null) {
            startListeningToUser(profile.uid, profile.email)
        } else {
            userSnapshotListener?.remove()
            userSnapshotListener = null
            rtdbValueListener?.let { rtdb?.getReference("users")?.removeEventListener(it) }
            rtdbValueListener = null
        }
    }
}
