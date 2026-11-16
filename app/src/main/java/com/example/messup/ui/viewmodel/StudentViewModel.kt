package com.example.messup.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.messup.data.model.AggregateMessStats
import com.example.messup.data.model.Announcement
import com.example.messup.data.model.FeedbackCategory
import com.example.messup.data.model.FeedbackComplaint
import com.example.messup.data.model.MealRating
import com.example.messup.data.model.MealType
import com.example.messup.data.model.MenuEntry
import com.example.messup.data.repository.AnnouncementRepository
import com.example.messup.data.repository.FeedbackRepository
import com.example.messup.data.repository.MenuRepository
import com.example.messup.data.repository.RatingRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class RatingUiState {
    object Idle : RatingUiState()
    object Submitting : RatingUiState()
    data class Success(val rating: MealRating) : RatingUiState()
    data class Error(val message: String) : RatingUiState()
}

class StudentViewModel(
    private val menuRepository: MenuRepository,
    private val ratingRepository: RatingRepository,
    private val feedbackRepository: FeedbackRepository,
    private val announcementRepository: AnnouncementRepository
) : ViewModel() {

    val menuEntries: StateFlow<List<MenuEntry>> = menuRepository.menuEntries
    val aggregateStats: StateFlow<AggregateMessStats> = ratingRepository.messStats
    val complaints: StateFlow<List<FeedbackComplaint>> = feedbackRepository.complaints
    val announcements: StateFlow<List<Announcement>> = announcementRepository.announcements

    private val _ratingState = MutableStateFlow<RatingUiState>(RatingUiState.Idle)
    val ratingState: StateFlow<RatingUiState> = _ratingState.asStateFlow()

    private val _selectedDate = MutableStateFlow(menuRepository.getTodayDate())
    val selectedDate: StateFlow<String> = _selectedDate.asStateFlow()

    fun selectDate(date: String) {
        _selectedDate.value = date
    }

    fun prepareRatingScreen() {
        _ratingState.value = RatingUiState.Idle
    }

    fun getDefaultMenuForMeal(date: String, mealType: MealType, messId: String = "MESS_001"): MenuEntry {
        return menuRepository.getDefaultMenuForMeal(date, mealType, messId)
    }

    fun submitMealRating(
        studentId: String,
        studentName: String,
        mealType: MealType,
        taste: Float,
        quality: Float,
        hygiene: Float,
        portion: Float,
        overall: Float,
        tags: List<String>,
        comment: String,
        messId: String = "MESS_001"
    ) {
        viewModelScope.launch {
            _ratingState.value = RatingUiState.Submitting
            val result = ratingRepository.submitRating(
                studentId = studentId,
                studentName = studentName,
                messId = messId,
                date = _selectedDate.value,
                mealType = mealType,
                taste = taste,
                quality = quality,
                hygiene = hygiene,
                portion = portion,
                overall = overall,
                tags = tags,
                comment = comment
            )
            result.fold(
                onSuccess = { _ratingState.value = RatingUiState.Success(it) },
                onFailure = { _ratingState.value = RatingUiState.Error(it.message ?: "Rating submission failed") }
            )
        }
    }

    fun submitComplaint(
        studentId: String,
        studentName: String,
        category: FeedbackCategory,
        mealType: MealType?,
        description: String,
        isPrivate: Boolean,
        photoUrl: String? = null,
        latitude: Double? = null,
        longitude: Double? = null,
        gpsLocationTag: String? = null,
        reportedToAdmin: Boolean = true,
        reportedToIncharge: Boolean = true,
        messId: String = "MESS_001"
    ) {
        viewModelScope.launch {
            feedbackRepository.submitFeedback(
                studentId = studentId,
                studentName = studentName,
                messId = messId,
                category = category,
                mealType = mealType,
                date = _selectedDate.value,
                description = description,
                photoUrl = photoUrl,
                latitude = latitude,
                longitude = longitude,
                gpsLocationTag = gpsLocationTag,
                isPrivate = isPrivate,
                reportedToAdmin = reportedToAdmin,
                reportedToIncharge = reportedToIncharge
            )
        }
    }

    fun getStatsForMess(messId: String): AggregateMessStats {
        return ratingRepository.getStatsForMess(messId)
    }

    fun resetRatingState() {
        _ratingState.value = RatingUiState.Idle
    }
}
