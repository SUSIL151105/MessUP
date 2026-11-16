package com.example.messup

import com.example.messup.data.model.ComplaintStatus
import com.example.messup.data.model.DishItem
import com.example.messup.data.model.FeedbackCategory
import com.example.messup.data.model.MealType
import com.example.messup.data.model.NoticePriority
import com.example.messup.data.repository.AnnouncementRepository
import com.example.messup.data.repository.AuthRepository
import com.example.messup.data.repository.FeedbackRepository
import com.example.messup.data.repository.MenuRepository
import com.example.messup.data.repository.RatingRepository
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class MessUpRepositoryTests {

    private lateinit var menuRepository: MenuRepository
    private lateinit var ratingRepository: RatingRepository
    private lateinit var feedbackRepository: FeedbackRepository
    private lateinit var announcementRepository: AnnouncementRepository
    private lateinit var authRepository: AuthRepository

    @Before
    fun setUp() {
        menuRepository = MenuRepository()
        ratingRepository = RatingRepository()
        feedbackRepository = FeedbackRepository()
        announcementRepository = AnnouncementRepository()
        authRepository = AuthRepository(null)
    }

    @Test
    fun testMenuRepository_SaveAndToggle() {
        val today = menuRepository.getTodayDate()
        val testDishes = listOf(
            DishItem(id = "DISH_001", name = "Aloo Paratha", isVeg = true, isAvailable = true)
        )

        menuRepository.saveOrUpdateMenu(today, MealType.BREAKFAST, testDishes, isPublished = true)

        val breakfast = menuRepository.getMenuForDateAndMeal(today, MealType.BREAKFAST)
        assertNotNull(breakfast)
        assertEquals(1, breakfast!!.dishes.size)

        menuRepository.toggleDishAvailability(today, MealType.BREAKFAST, "DISH_001")

        val updatedBreakfast = menuRepository.getMenuForDateAndMeal(today, MealType.BREAKFAST)
        assertNotNull(updatedBreakfast)
        assertEquals(false, updatedBreakfast!!.dishes.first().isAvailable)
    }

    @Test
    fun testRatingRepository_SubmitRatingAndDuplicatePolicy() {
        val today = "2026-10-24"
        val result = ratingRepository.submitRating(
            studentId = "STU_TEST_101",
            studentName = "Test Student",
            messId = "MESS_001",
            date = today,
            mealType = MealType.LUNCH,
            taste = 5.0f,
            quality = 4.5f,
            hygiene = 5.0f,
            portion = 4.0f,
            overall = 4.8f,
            tags = listOf("Fresh food", "Good taste"),
            comment = "Great lunch today!"
        )

        assertTrue(result.isSuccess)
        val rating = result.getOrNull()
        assertNotNull(rating)
        assertEquals("STU_TEST_101_MESS_001_${today}_LUNCH", rating!!.id)

        // Test duplicate submit updates existing rating rather than creating duplicate record
        val duplicateResult = ratingRepository.submitRating(
            studentId = "STU_TEST_101",
            studentName = "Test Student",
            messId = "MESS_001",
            date = today,
            mealType = MealType.LUNCH,
            taste = 4.0f,
            quality = 4.0f,
            hygiene = 4.0f,
            portion = 4.0f,
            overall = 4.0f,
            tags = listOf("Fresh food"),
            comment = "Updated review"
        )

        assertTrue(duplicateResult.isSuccess)
        val fetched = ratingRepository.getStudentRatingForMeal("STU_TEST_101", "MESS_001", today, MealType.LUNCH)
        assertNotNull(fetched)
        assertEquals(4.0f, fetched!!.ratings.overall, 0.01f)
    }

    @Test
    fun testFeedbackRepository_SubmitAndResolution() {
        val complaint = feedbackRepository.submitFeedback(
            studentId = "STU_102",
            studentName = "Test Student",
            category = FeedbackCategory.HYGIENE,
            mealType = MealType.DINNER,
            date = "2026-10-24",
            description = "Dining tables needed wiping around 8 PM."
        )

        assertNotNull(complaint.id)
        assertEquals(ComplaintStatus.SUBMITTED, complaint.status)

        feedbackRepository.respondToComplaint(
            complaintId = complaint.id,
            status = ComplaintStatus.RESOLVED,
            responseMessage = "Tables sanitized immediately.",
            responderName = "Mess Incharge"
        )

        val updated = feedbackRepository.complaints.value.find { it.id == complaint.id }
        assertNotNull(updated)
        assertEquals(ComplaintStatus.RESOLVED, updated!!.status)
        assertEquals("Tables sanitized immediately.", updated.officialResponse)
    }

    @Test
    fun testAnnouncementRepository_PostNotice() {
        val notice = announcementRepository.postAnnouncement(
            title = "Special Sunday Lunch",
            content = "Special menu item included this Sunday.",
            priority = NoticePriority.IMPORTANT
        )

        assertNotNull(notice.id)
        assertEquals("Special Sunday Lunch", notice.title)
        assertTrue(announcementRepository.announcements.value.contains(notice))
    }

    @Test
    fun testPasswordReset_EmailValidation() = runBlocking {
        val invalidResult = authRepository.sendPasswordResetEmail("invalid-email")
        assertTrue(invalidResult.isFailure)

        val validResult = authRepository.sendPasswordResetEmail("student@university.edu")
        assertTrue(validResult.isSuccess)
    }
}
