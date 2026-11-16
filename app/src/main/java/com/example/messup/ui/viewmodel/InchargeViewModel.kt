package com.example.messup.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.messup.data.model.AggregateMessStats
import com.example.messup.data.model.Announcement
import com.example.messup.data.model.ComplaintStatus
import com.example.messup.data.model.DishItem
import com.example.messup.data.model.FeedbackComplaint
import com.example.messup.data.model.MealType
import com.example.messup.data.model.MenuEntry
import com.example.messup.data.model.NoticePriority
import com.example.messup.data.repository.AnnouncementRepository
import com.example.messup.data.repository.FeedbackRepository
import com.example.messup.data.repository.MenuRepository
import com.example.messup.data.repository.RatingRepository
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class InchargeViewModel(
    private val menuRepository: MenuRepository,
    private val ratingRepository: RatingRepository,
    private val feedbackRepository: FeedbackRepository,
    private val announcementRepository: AnnouncementRepository
) : ViewModel() {

    val menuEntries: StateFlow<List<MenuEntry>> = menuRepository.menuEntries
    val aggregateStats: StateFlow<AggregateMessStats> = ratingRepository.messStats
    val complaints: StateFlow<List<FeedbackComplaint>> = feedbackRepository.complaints
    val announcements: StateFlow<List<Announcement>> = announcementRepository.announcements

    fun getDefaultMenuForMeal(date: String, mealType: MealType, messId: String = "MESS_001"): MenuEntry {
        return menuRepository.getDefaultMenuForMeal(date, mealType, messId)
    }

    fun toggleDishAvailability(date: String, mealType: MealType, dishId: String, messId: String = "") {
        menuRepository.toggleDishAvailability(date, mealType, dishId, messId)
    }

    fun saveOrUpdateMenu(
        date: String,
        mealType: MealType,
        dishes: List<DishItem>,
        isPublished: Boolean,
        updatedBy: String = "Mess Incharge",
        messId: String = "MESS_001"
    ) {
        menuRepository.saveOrUpdateMenu(date, mealType, dishes, isPublished, updatedBy, messId)
    }

    fun cancelMealPeriod(date: String, mealType: MealType, reason: String, messId: String = "") {
        menuRepository.cancelMealPeriod(date, mealType, reason, messId)
    }

    fun respondToComplaint(
        complaintId: String, 
        status: ComplaintStatus, 
        responseText: String,
        responderName: String = "Mess Incharge"
    ) {
        feedbackRepository.respondToComplaint(complaintId, status, responseText, responderName)
    }

    fun postAnnouncement(
        title: String, 
        content: String, 
        priority: NoticePriority,
        createdByName: String = "Mess Incharge",
        messId: String = "MESS_001"
    ) {
        announcementRepository.postAnnouncement(title, content, priority, createdByName, messId)
    }

    fun getStatsForMess(messId: String): AggregateMessStats {
        return ratingRepository.getStatsForMess(messId)
    }
}
