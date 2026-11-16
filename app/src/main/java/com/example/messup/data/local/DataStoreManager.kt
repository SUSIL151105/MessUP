package com.example.messup.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.example.messup.data.model.UserRole
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "messup_preferences")

class DataStoreManager(private val context: Context) {

    companion object {
        val KEY_ONBOARDING_COMPLETED = booleanPreferencesKey("onboarding_completed")
        val KEY_THEME_MODE = stringPreferencesKey("theme_mode") // "SYSTEM", "LIGHT", "DARK"
        val KEY_USER_ROLE = stringPreferencesKey("user_role") // "STUDENT", "FOOD_INCHARGE"
        val KEY_USER_EMAIL = stringPreferencesKey("user_email")
        val KEY_USER_NAME = stringPreferencesKey("user_name")
        val KEY_USER_UID = stringPreferencesKey("user_uid")
        val KEY_MESS_ID = stringPreferencesKey("mess_id")
        val KEY_HOSTEL_NAME = stringPreferencesKey("hostel_name")
        val KEY_MESS_NAME = stringPreferencesKey("mess_name")
        val KEY_PHONE = stringPreferencesKey("user_phone")
        val KEY_INSTITUTION_NAME = stringPreferencesKey("institution_name")
        val KEY_IS_APPROVED = booleanPreferencesKey("is_approved")
    }

    val isOnboardingCompleted: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[KEY_ONBOARDING_COMPLETED] ?: false
    }

    val themeMode: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[KEY_THEME_MODE] ?: "SYSTEM"
    }

    val userRole: Flow<UserRole?> = context.dataStore.data.map { preferences ->
        val roleStr = preferences[KEY_USER_ROLE]
        if (roleStr != null) {
            runCatching { UserRole.valueOf(roleStr) }.getOrNull()
        } else null
    }

    val userEmail: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[KEY_USER_EMAIL]
    }

    val userName: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[KEY_USER_NAME]
    }

    val userUid: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[KEY_USER_UID]
    }

    val hostelName: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[KEY_HOSTEL_NAME]
    }

    val messName: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[KEY_MESS_NAME]
    }

    val phone: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[KEY_PHONE]
    }

    val institutionName: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[KEY_INSTITUTION_NAME]
    }

    val isApproved: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[KEY_IS_APPROVED] ?: true
    }

    val messId: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[KEY_MESS_ID] ?: "MESS_001"
    }

    suspend fun setOnboardingCompleted(completed: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[KEY_ONBOARDING_COMPLETED] = completed
        }
    }

    suspend fun setThemeMode(mode: String) {
        context.dataStore.edit { preferences ->
            preferences[KEY_THEME_MODE] = mode
        }
    }

    suspend fun saveUserSession(
        uid: String,
        email: String,
        name: String,
        role: UserRole,
        messId: String = "MESS_001",
        hostelName: String = "",
        messName: String = "",
        phone: String = "",
        institutionName: String = "",
        isApproved: Boolean = true
    ) {
        context.dataStore.edit { preferences ->
            if (uid.isNotBlank()) preferences[KEY_USER_UID] = uid
            if (email.isNotBlank()) preferences[KEY_USER_EMAIL] = email
            if (name.isNotBlank() && name != "User" && !name.contains("@")) preferences[KEY_USER_NAME] = name
            preferences[KEY_USER_ROLE] = role.name
            if (messId.isNotBlank()) preferences[KEY_MESS_ID] = messId
            if (hostelName.isNotBlank()) preferences[KEY_HOSTEL_NAME] = hostelName
            if (messName.isNotBlank()) preferences[KEY_MESS_NAME] = messName
            if (phone.isNotBlank()) preferences[KEY_PHONE] = phone
            if (institutionName.isNotBlank()) preferences[KEY_INSTITUTION_NAME] = institutionName
            preferences[KEY_IS_APPROVED] = isApproved
        }
    }

    suspend fun clearUserSession() {
        context.dataStore.edit { preferences ->
            preferences.remove(KEY_USER_UID)
            preferences.remove(KEY_USER_EMAIL)
            preferences.remove(KEY_USER_NAME)
            preferences.remove(KEY_USER_ROLE)
            preferences.remove(KEY_MESS_ID)
            preferences.remove(KEY_HOSTEL_NAME)
            preferences.remove(KEY_MESS_NAME)
            preferences.remove(KEY_PHONE)
            preferences.remove(KEY_INSTITUTION_NAME)
            preferences.remove(KEY_IS_APPROVED)
        }
    }

    suspend fun saveUserPassword(email: String, newPassword: String) {
        val key = stringPreferencesKey("pass_" + email.trim().lowercase())
        context.dataStore.edit { preferences ->
            preferences[key] = newPassword.trim()
        }
    }

    suspend fun getUserPassword(email: String): String? {
        val key = stringPreferencesKey("pass_" + email.trim().lowercase())
        var savedPass: String? = null
        context.dataStore.data.collect { preferences ->
            savedPass = preferences[key]
            return@collect
        }
        return savedPass
    }
}
