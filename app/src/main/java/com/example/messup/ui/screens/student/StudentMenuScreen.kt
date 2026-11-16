package com.example.messup.ui.screens.student

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Fastfood
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.RateReview
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.messup.data.model.MealType
import com.example.messup.ui.components.VegNonVegBadge
import com.example.messup.ui.viewmodel.StudentViewModel

import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

import com.example.messup.ui.viewmodel.AuthViewModel

@Composable
fun StudentMenuScreen(
    studentViewModel: StudentViewModel,
    authViewModel: AuthViewModel? = null,
    onNavigateRating: (MealType) -> Unit
) {
    val userProfile by authViewModel?.currentUserProfile?.collectAsState() ?: remember { mutableStateOf(null) }
    val studentMessId = userProfile?.messId?.ifBlank { null }

    val menus by studentViewModel.menuEntries.collectAsState()

    // 7-Day Weekly Calendar Dates
    val weekDates = remember {
        val cal = Calendar.getInstance()
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val labelSdf = SimpleDateFormat("EEE, MMM d", Locale.getDefault())
        (0..6).map { dayOffset ->
            val tempCal = cal.clone() as Calendar
            tempCal.add(Calendar.DAY_OF_YEAR, dayOffset)
            val dateStr = sdf.format(tempCal.time)
            val labelStr = when (dayOffset) {
                0 -> "Today"
                1 -> "Tomorrow"
                else -> labelSdf.format(tempCal.time)
            }
            dateStr to labelStr
        }
    }

    var selectedTabIndex by remember { mutableIntStateOf(0) }
    val (selectedDate, selectedDateLabel) = weekDates[selectedTabIndex]

    val filteredMenus = menus.filter { 
        it.date == selectedDate && (studentMessId == null || it.messId.isBlank() || it.messId == studentMessId)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // 7-Day Weekly Calendar Tab Row
        ScrollableTabRow(
            selectedTabIndex = selectedTabIndex,
            edgePadding = 12.dp,
            containerColor = MaterialTheme.colorScheme.surface
        ) {
            weekDates.forEachIndexed { index, pair ->
                Tab(
                    selected = selectedTabIndex == index,
                    onClick = { selectedTabIndex = index },
                    text = {
                        Text(
                            text = pair.second,
                            maxLines = 1,
                            softWrap = false,
                            style = MaterialTheme.typography.labelMedium.copy(
                                fontWeight = if (selectedTabIndex == index) FontWeight.Bold else FontWeight.Medium,
                                fontSize = 12.5.sp
                            )
                        )
                    }
                )
            }
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            item {
                Text(
                    text = "Weekly Schedule: $selectedDateLabel ($selectedDate)",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }

            items(MealType.values()) { mealType ->
                val menuEntry = filteredMenus.find { it.mealType == mealType }
                val effectiveEntry = if (menuEntry != null && menuEntry.dishes.isNotEmpty()) {
                    menuEntry
                } else {
                    studentViewModel.getDefaultMenuForMeal(selectedDate, mealType, studentMessId ?: "MESS_001")
                }
                val dishes = effectiveEntry.dishes

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Filled.Fastfood,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = mealType.displayName,
                                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                                )
                            }

                            Button(
                                onClick = {
                                    studentViewModel.prepareRatingScreen()
                                    onNavigateRating(mealType)
                                },
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.RateReview,
                                    contentDescription = null,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Rate", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold))
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        if (menuEntry?.isCancelled == true) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Filled.Info, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Cancelled: ${menuEntry.cancellationReason ?: "No details provided"}",
                                    color = MaterialTheme.colorScheme.error,
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }
                        } else if (dishes.isNotEmpty()) {
                            dishes.forEach { dish ->
                                val computedIsEgg = dish.containsEgg || dish.name.contains("egg", ignoreCase = true) || dish.name.contains("omelette", ignoreCase = true)
                                val computedIsNonVeg = (dish.isNonVeg || dish.name.contains("chicken", ignoreCase = true) || dish.name.contains("mutton", ignoreCase = true) || dish.name.contains("fish", ignoreCase = true) || dish.name.contains("non-veg", ignoreCase = true)) && !computedIsEgg
                                val computedIsVeg = if (computedIsEgg || computedIsNonVeg) false else dish.isVeg

                                Column(modifier = Modifier.padding(vertical = 4.dp)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        VegNonVegBadge(
                                            isVeg = computedIsVeg,
                                            isNonVeg = computedIsNonVeg,
                                            containsEgg = computedIsEgg,
                                            showLabel = true
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = dish.name,
                                            style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold),
                                            color = if (dish.isAvailable) MaterialTheme.colorScheme.onSurface else Color.Gray
                                        )
                                        if (!dish.isAvailable) {
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(
                                                text = "Unavailable",
                                                style = MaterialTheme.typography.labelSmall,
                                                color = MaterialTheme.colorScheme.error
                                            )
                                        }
                                    }
                                    if (dish.description.isNotBlank()) {
                                        Text(
                                            text = dish.description,
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.padding(start = 24.dp)
                                        )
                                    }
                                }
                            }
                        } else {
                            Text(
                                text = "No items published yet for this meal.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }
    }
}
