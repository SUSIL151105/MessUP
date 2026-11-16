package com.example.messup

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.example.messup.data.local.DataStoreManager
import com.example.messup.data.repository.AnnouncementRepository
import com.example.messup.data.repository.AuthRepository
import com.example.messup.data.repository.FeedbackRepository
import com.example.messup.data.repository.MenuRepository
import com.example.messup.data.repository.RatingRepository
import com.example.messup.ui.navigation.MessUpApp
import com.example.messup.ui.theme.MessUPTheme
import com.example.messup.ui.viewmodel.AuthViewModel
import com.example.messup.ui.viewmodel.InchargeViewModel
import com.example.messup.ui.viewmodel.StudentViewModel

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val dataStoreManager = DataStoreManager(applicationContext)
        val authRepository = AuthRepository(dataStoreManager)
        val menuRepository = MenuRepository()
        val ratingRepository = RatingRepository()
        val feedbackRepository = FeedbackRepository(applicationContext)
        val announcementRepository = AnnouncementRepository()

        val authViewModel = AuthViewModel(authRepository)
        val studentViewModel = StudentViewModel(
            menuRepository,
            ratingRepository,
            feedbackRepository,
            announcementRepository
        )
        val inchargeViewModel = InchargeViewModel(
            menuRepository,
            ratingRepository,
            feedbackRepository,
            announcementRepository
        )

        setContent {
            MessUPTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MessUpApp(
                        authViewModel = authViewModel,
                        studentViewModel = studentViewModel,
                        inchargeViewModel = inchargeViewModel,
                        dataStoreManager = dataStoreManager
                    )
                }
            }
        }
    }
}
