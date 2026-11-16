package com.example.messup.data.repository

import com.example.messup.data.model.DishItem
import com.example.messup.data.model.MealType
import com.example.messup.data.model.MenuEntry
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class MenuRepository {

    private val rtdb: FirebaseDatabase? by lazy {
        runCatching {
            FirebaseDatabase.getInstance("https://messup-ee9fc-default-rtdb.firebaseio.com")
        }.getOrNull()
    }

    private val firestore: FirebaseFirestore? by lazy {
        runCatching { FirebaseFirestore.getInstance() }.getOrNull()
    }

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

    fun getTodayDate(): String = dateFormat.format(Date())

    fun getTomorrowDate(): String {
        val cal = Calendar.getInstance()
        cal.add(Calendar.DAY_OF_YEAR, 1)
        return dateFormat.format(cal.time)
    }

    private val _menuEntries = MutableStateFlow<List<MenuEntry>>(emptyList())
    val menuEntries: StateFlow<List<MenuEntry>> = _menuEntries.asStateFlow()

    init {
        // 1. Real-time Firebase Realtime Database Listener
        rtdb?.getReference("menuEntries")?.addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                runCatching {
                    val items = mutableListOf<MenuEntry>()
                    for (child in snapshot.children) {
                        val rawMap = child.value as? Map<*, *> ?: continue
                        val map = rawMap.entries.associate { (k, v) -> k.toString() to (v ?: "") }
                        parseMenuEntryManually(child.key ?: "", map)?.let { items.add(it) }
                    }
                    _menuEntries.value = items
                }
            }
            override fun onCancelled(error: DatabaseError) {}
        })

        // 2. Fallback Cloud Firestore Listener for Menus (Admin <-> Incharge <-> Student sync)
        firestore?.collection("menuEntries")?.addSnapshotListener { snapshot, error ->
            if (error != null || snapshot == null) return@addSnapshotListener
            runCatching {
                val items = snapshot.documents.mapNotNull { doc ->
                    doc.toObject(MenuEntry::class.java)?.copy(id = doc.id)
                }
                if (items.isNotEmpty()) {
                    _menuEntries.value = items
                }
            }
        }
    }

    private fun parseMenuEntryManually(entryId: String, data: Map<String, Any?>): MenuEntry? {
        return try {
            val mealTypeStr = data["mealType"]?.toString() ?: MealType.BREAKFAST.name
            val mealType = runCatching { MealType.valueOf(mealTypeStr) }.getOrDefault(MealType.BREAKFAST)
            val isPublishedVal = when (val p = data["isPublished"]) {
                is Boolean -> p
                is String -> p.toBooleanStrictOrNull() ?: true
                else -> true
            }
            val isCancelledVal = when (val c = data["isCancelled"]) {
                is Boolean -> c
                is String -> c.toBooleanStrictOrNull() ?: false
                else -> false
            }
            val updatedAtVal = when (val u = data["updatedAt"]) {
                is Number -> u.toLong()
                is String -> u.toLongOrNull() ?: System.currentTimeMillis()
                else -> System.currentTimeMillis()
            }

            // Parse dishes list safely
            val dishesList = mutableListOf<DishItem>()
            val rawDishes = data["dishes"]
            if (rawDishes is List<*>) {
                for (dishObj in rawDishes) {
                    if (dishObj is Map<*, *>) {
                        val dishMap = dishObj.entries.associate { (k, v) -> k.toString() to (v ?: "") }
                        val isAvailableVal = when (val a = dishMap["isAvailable"]) {
                            is Boolean -> a
                            is String -> a.toBooleanStrictOrNull() ?: true
                            else -> true
                        }
                        val isVegVal = when (val v = dishMap["isVeg"]) {
                            is Boolean -> v
                            is String -> v.toBooleanStrictOrNull() ?: true
                            else -> true
                        }
                        val isNonVegVal = when (val nv = dishMap["isNonVeg"]) {
                            is Boolean -> nv
                            is String -> nv.toBooleanStrictOrNull() ?: false
                            else -> false
                        }
                        val containsEggVal = when (val ce = dishMap["containsEgg"]) {
                            is Boolean -> ce
                            is String -> ce.toBooleanStrictOrNull() ?: false
                            else -> false
                        }
                        dishesList.add(
                            DishItem(
                                id = dishMap["id"]?.toString() ?: "",
                                name = dishMap["name"]?.toString() ?: "",
                                description = dishMap["description"]?.toString() ?: "",
                                isVeg = isVegVal,
                                isNonVeg = isNonVegVal,
                                containsEgg = containsEggVal,
                                isAvailable = isAvailableVal
                            )
                        )
                    }
                }
            }

            MenuEntry(
                id = entryId,
                messId = data["messId"]?.toString() ?: "MESS_001",
                date = data["date"]?.toString() ?: "",
                mealType = mealType,
                dishes = dishesList,
                isPublished = isPublishedVal,
                isCancelled = isCancelledVal,
                cancellationReason = data["cancellationReason"]?.toString(),
                updatedAt = updatedAtVal,
                updatedBy = data["updatedBy"]?.toString() ?: ""
            )
        } catch (_: Exception) {
            null
        }
    }

    fun getMenuForDateAndMeal(date: String, mealType: MealType, messId: String = ""): MenuEntry? {
        return _menuEntries.value.find { 
            (messId.isBlank() || it.messId.isBlank() || it.messId == messId) && it.date == date && it.mealType == mealType 
        }
    }

    fun getDefaultMenuForMeal(date: String, mealType: MealType, messId: String = ""): MenuEntry {
        val existing = getMenuForDateAndMeal(date, mealType, messId)
        if (existing != null) return existing

        val effectiveMessId = messId.ifBlank { "MESS_001" }
        return MenuEntry(
            id = "${effectiveMessId}_${date}_${mealType.name}",
            messId = effectiveMessId,
            date = date,
            mealType = mealType,
            dishes = emptyList(),
            isPublished = false,
            updatedAt = System.currentTimeMillis(),
            updatedBy = ""
        )
    }

    fun getMenusForDate(date: String, messId: String = ""): List<MenuEntry> {
        return _menuEntries.value.filter { 
            (messId.isBlank() || it.messId.isBlank() || it.messId == messId) && it.date == date 
        }
    }

    fun toggleDishAvailability(date: String, mealType: MealType, dishId: String, messId: String = "") {
        val currentList = _menuEntries.value.toMutableList()
        val effectiveMessId = if (messId.isNotBlank()) messId else "MESS_001"
        var index = currentList.indexOfFirst { 
            (it.messId.isBlank() || it.messId == effectiveMessId) && it.date == date && it.mealType == mealType 
        }
        if (index == -1) {
            val defaultEntry = getDefaultMenuForMeal(date, mealType, effectiveMessId)
            currentList.add(defaultEntry)
            index = currentList.size - 1
        }
        val oldEntry = currentList[index]
        val updatedDishes = oldEntry.dishes.map { dish ->
            if (dish.id == dishId) dish.copy(isAvailable = !dish.isAvailable) else dish
        }
        val targetMessId = if (oldEntry.messId.isNotBlank()) oldEntry.messId else effectiveMessId
        val canonicalId = "${targetMessId}_${date}_${mealType.name}"
        val updatedEntry = oldEntry.copy(
            id = canonicalId,
            messId = targetMessId,
            dishes = updatedDishes, 
            updatedAt = System.currentTimeMillis()
        )
        currentList[index] = updatedEntry
        _menuEntries.value = currentList

        // 1. Sync to Firebase Realtime Database
        val dishesPayload = updatedDishes.map { d ->
            mapOf(
                "id" to d.id,
                "name" to d.name,
                "description" to d.description,
                "isVeg" to d.isVeg,
                "isNonVeg" to d.isNonVeg,
                "containsEgg" to d.containsEgg,
                "isAvailable" to d.isAvailable
            )
        }
        val menuPayload = mapOf<String, Any?>(
            "id" to canonicalId,
            "messId" to targetMessId,
            "date" to date,
            "mealType" to mealType.name,
            "dishes" to dishesPayload,
            "isPublished" to updatedEntry.isPublished,
            "isCancelled" to updatedEntry.isCancelled,
            "cancellationReason" to updatedEntry.cancellationReason,
            "updatedAt" to updatedEntry.updatedAt,
            "updatedBy" to updatedEntry.updatedBy
        )
        runCatching {
            rtdb?.getReference("menuEntries")?.child(canonicalId)?.setValue(menuPayload)
        }
        // 2. Sync to Cloud Firestore fallback
        firestore?.collection("menuEntries")?.document(canonicalId)?.set(menuPayload)
    }

    fun saveOrUpdateMenu(
        date: String,
        mealType: MealType,
        dishes: List<DishItem>,
        isPublished: Boolean = true,
        updatedBy: String = "Mess Incharge",
        messId: String = "MESS_001"
    ) {
        val currentList = _menuEntries.value.toMutableList()
        val effectiveMessId = if (messId.isNotBlank()) messId else "MESS_001"
        val index = currentList.indexOfFirst { 
            (it.messId.isBlank() || it.messId == effectiveMessId) && it.date == date && it.mealType == mealType 
        }
        val entryId = "${effectiveMessId}_${date}_${mealType.name}"
        val entry = MenuEntry(
            id = entryId,
            messId = effectiveMessId,
            date = date,
            mealType = mealType,
            dishes = dishes,
            isPublished = isPublished,
            updatedAt = System.currentTimeMillis(),
            updatedBy = updatedBy
        )

        if (index != -1) {
            currentList[index] = entry
        } else {
            currentList.add(entry)
        }
        _menuEntries.value = currentList

        // 1. Sync to Firebase Realtime Database
        val dishesPayload = dishes.map { d ->
            mapOf(
                "id" to d.id,
                "name" to d.name,
                "description" to d.description,
                "isVeg" to d.isVeg,
                "isNonVeg" to d.isNonVeg,
                "containsEgg" to d.containsEgg,
                "isAvailable" to d.isAvailable
            )
        }
        val menuPayload = mapOf<String, Any?>(
            "id" to entryId,
            "messId" to effectiveMessId,
            "date" to date,
            "mealType" to mealType.name,
            "dishes" to dishesPayload,
            "isPublished" to isPublished,
            "isCancelled" to entry.isCancelled,
            "cancellationReason" to entry.cancellationReason,
            "updatedAt" to entry.updatedAt,
            "updatedBy" to updatedBy
        )
        runCatching {
            rtdb?.getReference("menuEntries")?.child(entryId)?.setValue(menuPayload)
        }
        // 2. Sync to Cloud Firestore fallback
        firestore?.collection("menuEntries")?.document(entryId)?.set(menuPayload)
    }

    fun cancelMealPeriod(date: String, mealType: MealType, reason: String, messId: String = "") {
        val currentList = _menuEntries.value.toMutableList()
        val effectiveMessId = if (messId.isNotBlank()) messId else "MESS_001"
        var index = currentList.indexOfFirst { 
            (it.messId.isBlank() || it.messId == effectiveMessId) && it.date == date && it.mealType == mealType 
        }
        if (index == -1) {
            val defaultEntry = getDefaultMenuForMeal(date, mealType, effectiveMessId)
            currentList.add(defaultEntry)
            index = currentList.size - 1
        }
        val oldEntry = currentList[index]
        val canonicalId = "${effectiveMessId}_${date}_${mealType.name}"
        val updatedEntry = oldEntry.copy(
            id = canonicalId,
            messId = effectiveMessId,
            isCancelled = true,
            cancellationReason = reason,
            updatedAt = System.currentTimeMillis()
        )
        currentList[index] = updatedEntry
        _menuEntries.value = currentList

        // 1. Sync to Firebase Realtime Database
        runCatching {
            rtdb?.getReference("menuEntries")?.child(canonicalId)?.setValue(updatedEntry)
        }
        // 2. Sync to Cloud Firestore fallback
        firestore?.collection("menuEntries")?.document(canonicalId)?.set(updatedEntry)
    }
}
