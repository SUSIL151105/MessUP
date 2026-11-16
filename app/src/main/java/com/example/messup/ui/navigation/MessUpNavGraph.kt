package com.example.messup.ui.navigation

import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.Campaign
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.EditCalendar
import androidx.compose.material.icons.filled.Feedback
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.messup.data.local.DataStoreManager
import com.example.messup.data.model.MealType
import com.example.messup.data.model.UserRole
import com.example.messup.ui.screens.auth.FoodInchargeLoginScreen
import com.example.messup.ui.screens.auth.StudentLoginScreen
import com.example.messup.ui.screens.auth.StudentRegisterScreen
import com.example.messup.ui.screens.incharge.InchargeAnnouncementsScreen
import com.example.messup.ui.screens.incharge.InchargeFeedbackInboxScreen
import com.example.messup.ui.screens.incharge.InchargeHomeScreen
import com.example.messup.ui.screens.incharge.InchargeMenuManagerScreen
import com.example.messup.ui.screens.onboarding.OnboardingScreen
import com.example.messup.ui.screens.splash.SplashScreen
import com.example.messup.ui.screens.student.StudentFeedbackScreen
import com.example.messup.ui.screens.student.StudentHomeScreen
import com.example.messup.ui.screens.student.StudentInsightsScreen
import com.example.messup.ui.screens.student.StudentMenuScreen
import com.example.messup.ui.screens.student.StudentRatingScreen
import com.example.messup.ui.viewmodel.AuthViewModel
import com.example.messup.ui.viewmodel.InchargeViewModel
import com.example.messup.ui.viewmodel.StudentViewModel

sealed class Screen(val route: String, val title: String, val icon: ImageVector? = null) {
    object Splash : Screen("splash", "Splash")
    object Onboarding : Screen("onboarding", "Onboarding")
    object StudentLogin : Screen("student_login", "Login")
    object StudentRegister : Screen("student_register", "Register")
    object InchargeLogin : Screen("incharge_login", "Incharge Login")

    // Student Bottom Nav Tabs
    object StudentHome : Screen("student_home", "Home", Icons.Filled.Home)
    object StudentMenu : Screen("student_menu", "Menu", Icons.Filled.MenuBook)
    object StudentFeedback : Screen("student_feedback", "Feedback", Icons.Filled.Feedback)
    object StudentInsights : Screen("student_insights", "Insights", Icons.Filled.Analytics)
    object StudentRating : Screen("student_rating/{mealType}", "Rate Meal") {
        fun createRoute(mealType: MealType) = "student_rating/${mealType.name}"
    }

    // Incharge Bottom Nav Tabs
    object InchargeHome : Screen("incharge_home", "Dashboard", Icons.Filled.Dashboard)
    object InchargeMenuManager : Screen("incharge_menu_manager", "Menus", Icons.Filled.EditCalendar)
    object InchargeFeedbackInbox : Screen("incharge_feedback_inbox", "Inbox", Icons.Filled.Feedback)
    object InchargeAnnouncements : Screen("incharge_announcements", "Notices", Icons.Filled.Campaign)
}

@Composable
fun MessUpApp(
    authViewModel: AuthViewModel,
    studentViewModel: StudentViewModel,
    inchargeViewModel: InchargeViewModel,
    dataStoreManager: DataStoreManager,
    navController: NavHostController = rememberNavController()
) {
    val userProfile by authViewModel.currentUserProfile.collectAsState()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val studentTabs = listOf(
        Screen.StudentHome,
        Screen.StudentMenu,
        Screen.StudentFeedback,
        Screen.StudentInsights
    )

    val inchargeTabs = listOf(
        Screen.InchargeHome,
        Screen.InchargeMenuManager,
        Screen.InchargeFeedbackInbox,
        Screen.InchargeAnnouncements
    )

    val isStudentTab = studentTabs.any { it.route == currentRoute }
    val isInchargeTab = inchargeTabs.any { it.route == currentRoute }

    Scaffold(
        bottomBar = {
            if (isStudentTab || isInchargeTab) {
                NavigationBar {
                    val tabs = if (isStudentTab) studentTabs else inchargeTabs
                    tabs.forEach { screen ->
                        NavigationBarItem(
                            icon = { Icon(screen.icon!!, contentDescription = screen.title) },
                            label = { Text(screen.title) },
                            selected = currentRoute == screen.route,
                            onClick = {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Splash.route,
            modifier = Modifier.padding(innerPadding),
            enterTransition = { slideInHorizontally(initialOffsetX = { 300 }) + fadeIn(animationSpec = tween(250)) },
            exitTransition = { slideOutHorizontally(targetOffsetX = { -300 }) + fadeOut(animationSpec = tween(250)) },
            popEnterTransition = { slideInHorizontally(initialOffsetX = { -300 }) + fadeIn(animationSpec = tween(250)) },
            popExitTransition = { slideOutHorizontally(targetOffsetX = { 300 }) + fadeOut(animationSpec = tween(250)) }
        ) {
            composable(Screen.Splash.route) {
                SplashScreen(
                    authViewModel = authViewModel,
                    dataStoreManager = dataStoreManager,
                    onNavigateNext = { savedRole ->
                        val targetRoute = when (savedRole) {
                            UserRole.STUDENT -> Screen.StudentHome.route
                            UserRole.FOOD_INCHARGE -> Screen.InchargeHome.route
                            else -> Screen.Onboarding.route
                        }
                        navController.navigate(targetRoute) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Onboarding.route) {
                OnboardingScreen(
                    onFinish = {
                        navController.navigate(Screen.StudentLogin.route) {
                            popUpTo(Screen.Onboarding.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.StudentLogin.route) {
                StudentLoginScreen(
                    authViewModel = authViewModel,
                    onNavigateRegister = { navController.navigate(Screen.StudentRegister.route) },
                    onNavigateInchargeLogin = { navController.navigate(Screen.InchargeLogin.route) },
                    onLoginSuccess = {
                        val role = authViewModel.currentUserProfile.value?.role
                        val route = if (role == UserRole.FOOD_INCHARGE) Screen.InchargeHome.route else Screen.StudentHome.route
                        navController.navigate(route) {
                            popUpTo(Screen.StudentLogin.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.StudentRegister.route) {
                StudentRegisterScreen(
                    authViewModel = authViewModel,
                    onNavigateLogin = { navController.navigate(Screen.StudentLogin.route) },
                    onRegisterSuccess = {
                        navController.navigate(Screen.StudentHome.route) {
                            popUpTo(Screen.StudentRegister.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.InchargeLogin.route) {
                FoodInchargeLoginScreen(
                    authViewModel = authViewModel,
                    onNavigateStudentLogin = { navController.navigate(Screen.StudentLogin.route) },
                    onLoginSuccess = {
                        navController.navigate(Screen.InchargeHome.route) {
                            popUpTo(Screen.InchargeLogin.route) { inclusive = true }
                        }
                    }
                )
            }

            // Student Screens
            composable(Screen.StudentHome.route) {
                StudentHomeScreen(
                    authViewModel = authViewModel,
                    studentViewModel = studentViewModel,
                    onNavigateMenu = { navController.navigate(Screen.StudentMenu.route) },
                    onNavigateRating = { mealType -> navController.navigate(Screen.StudentRating.createRoute(mealType)) },
                    onNavigateFeedback = { navController.navigate(Screen.StudentFeedback.route) },
                    onNavigateInsights = { navController.navigate(Screen.StudentInsights.route) },
                    onLogout = {
                        navController.navigate(Screen.StudentLogin.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.StudentMenu.route) {
                StudentMenuScreen(
                    studentViewModel = studentViewModel,
                    authViewModel = authViewModel,
                    onNavigateRating = { mealType -> navController.navigate(Screen.StudentRating.createRoute(mealType)) }
                )
            }

            composable(
                route = Screen.StudentRating.route,
                arguments = listOf(navArgument("mealType") { type = NavType.StringType })
            ) { backStackEntry ->
                val mealTypeStr = backStackEntry.arguments?.getString("mealType") ?: MealType.BREAKFAST.name
                val mealType = runCatching { MealType.valueOf(mealTypeStr) }.getOrDefault(MealType.BREAKFAST)

                StudentRatingScreen(
                    mealType = mealType,
                    authViewModel = authViewModel,
                    studentViewModel = studentViewModel,
                    onSubmitted = { navController.popBackStack() }
                )
            }

            composable(Screen.StudentFeedback.route) {
                StudentFeedbackScreen(
                    authViewModel = authViewModel,
                    studentViewModel = studentViewModel
                )
            }

            composable(Screen.StudentInsights.route) {
                StudentInsightsScreen(studentViewModel = studentViewModel)
            }

            // Food Incharge Screens
            composable(Screen.InchargeHome.route) {
                InchargeHomeScreen(
                    authViewModel = authViewModel,
                    inchargeViewModel = inchargeViewModel,
                    onNavigateMenuManager = { navController.navigate(Screen.InchargeMenuManager.route) },
                    onNavigateFeedbackInbox = { navController.navigate(Screen.InchargeFeedbackInbox.route) },
                    onNavigateAnnouncements = { navController.navigate(Screen.InchargeAnnouncements.route) },
                    onLogout = {
                        navController.navigate(Screen.StudentLogin.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.InchargeMenuManager.route) {
                InchargeMenuManagerScreen(
                    inchargeViewModel = inchargeViewModel,
                    authViewModel = authViewModel
                )
            }

            composable(Screen.InchargeFeedbackInbox.route) {
                InchargeFeedbackInboxScreen(inchargeViewModel = inchargeViewModel)
            }

            composable(Screen.InchargeAnnouncements.route) {
                InchargeAnnouncementsScreen(inchargeViewModel = inchargeViewModel)
            }
        }
    }
}
