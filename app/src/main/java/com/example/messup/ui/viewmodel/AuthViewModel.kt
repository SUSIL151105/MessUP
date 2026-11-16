package com.example.messup.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.messup.data.local.DataStoreManager
import com.example.messup.data.model.UserProfile
import com.example.messup.data.model.UserRole
import com.example.messup.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch

sealed class AuthUiState {
    object Idle : AuthUiState()
    object Loading : AuthUiState()
    data class Success(val profile: UserProfile) : AuthUiState()
    data class Error(val message: String) : AuthUiState()
}

class AuthViewModel(private val authRepository: AuthRepository) : ViewModel() {

    val currentUserProfile: StateFlow<UserProfile?> = authRepository.currentUserProfile

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun registerStudent(
        name: String,
        email: String,
        phone: String,
        pass: String,
        institution: String,
        hostel: String,
        mess: String
    ) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            val result = authRepository.registerStudent(name, email, phone, pass, institution, hostel, mess)
            result.fold(
                onSuccess = { _uiState.value = AuthUiState.Success(it) },
                onFailure = { _uiState.value = AuthUiState.Error(it.message ?: "Registration failed") }
            )
        }
    }

    fun loginUser(email: String, pass: String, targetRole: UserRole? = null) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            val result = authRepository.loginUser(email, pass, targetRole)
            result.fold(
                onSuccess = { _uiState.value = AuthUiState.Success(it) },
                onFailure = { _uiState.value = AuthUiState.Error(it.message ?: "Login failed") }
            )
        }
    }

    fun checkAutoLogin(dataStoreManager: DataStoreManager, onSessionResolved: (UserRole?) -> Unit) {
        viewModelScope.launch {
            val uid = dataStoreManager.userUid.firstOrNull()
            val email = dataStoreManager.userEmail.firstOrNull()
            val name = dataStoreManager.userName.firstOrNull()
            val role = dataStoreManager.userRole.firstOrNull()
            val hostelName = dataStoreManager.hostelName.firstOrNull() ?: ""
            val messName = dataStoreManager.messName.firstOrNull() ?: ""
            val phone = dataStoreManager.phone.firstOrNull() ?: ""
            val institutionName = dataStoreManager.institutionName.firstOrNull() ?: ""
            val messId = dataStoreManager.messId.firstOrNull() ?: "MESS_001"
            val isApproved = dataStoreManager.isApproved.firstOrNull() ?: true

            if (!uid.isNullOrBlank() && !email.isNullOrBlank() && role != null) {
                authRepository.restoreSession(
                    uid = uid,
                    email = email,
                    name = name ?: "User",
                    role = role,
                    hostelName = hostelName,
                    messName = messName,
                    phone = phone,
                    institutionName = institutionName,
                    messId = messId,
                    isApproved = isApproved
                )
                authRepository.currentUserProfile.value?.let {
                    _uiState.value = AuthUiState.Success(it)
                }
                onSessionResolved(role)
            } else {
                onSessionResolved(null)
            }
        }
    }

    fun sendPasswordResetEmail(email: String, onResult: (Result<Unit>) -> Unit) {
        viewModelScope.launch {
            val result = authRepository.sendPasswordResetEmail(email)
            onResult(result)
        }
    }

    fun updateProfile(name: String, phone: String, hostelOrMessName: String, messId: String = "") {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            val result = authRepository.updateProfile(name, phone, hostelOrMessName, messId)
            result.fold(
                onSuccess = { _uiState.value = AuthUiState.Success(it) },
                onFailure = { _uiState.value = AuthUiState.Error(it.message ?: "Update failed") }
            )
        }
    }

    fun refreshProfile() {
        viewModelScope.launch {
            authRepository.refreshProfile()
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _uiState.value = AuthUiState.Idle
        }
    }

    fun resetState() {
        _uiState.value = AuthUiState.Idle
    }
}
