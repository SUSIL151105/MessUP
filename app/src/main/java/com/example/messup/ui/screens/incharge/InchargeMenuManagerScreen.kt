package com.example.messup.ui.screens.incharge

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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Switch
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.messup.data.model.DishItem
import com.example.messup.data.model.MealType
import com.example.messup.ui.components.VegNonVegBadge
import com.example.messup.ui.viewmodel.InchargeViewModel

import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

import com.example.messup.ui.viewmodel.AuthViewModel

@Composable
fun InchargeMenuManagerScreen(
    inchargeViewModel: InchargeViewModel,
    authViewModel: AuthViewModel? = null
) {
    val userProfile by authViewModel?.currentUserProfile?.collectAsState() ?: remember { mutableStateOf(null) }
    val effectiveMessId = userProfile?.messId?.ifBlank { "MESS_001" } ?: "MESS_001"
    val inchargeName = userProfile?.name?.ifBlank { "Food Incharge" } ?: "Food Incharge"

    val menus by inchargeViewModel.menuEntries.collectAsState()

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

    var selectedDateIndex by remember { mutableIntStateOf(0) }
    val (selectedDate, selectedDateLabel) = weekDates[selectedDateIndex]

    var selectedMealIndex by remember { mutableIntStateOf(0) }
    val selectedMeal = MealType.values()[selectedMealIndex]

    val currentEntry = menus.find { 
        (it.messId.isBlank() || it.messId == effectiveMessId) && it.date == selectedDate && it.mealType == selectedMeal 
    }
    val effectiveEntry = if (currentEntry != null && currentEntry.dishes.isNotEmpty()) {
        currentEntry
    } else {
        inchargeViewModel.getDefaultMenuForMeal(selectedDate, selectedMeal, effectiveMessId)
    }

    val dishes = remember(effectiveEntry) {
        mutableStateListOf<DishItem>().apply {
            addAll(effectiveEntry.dishes)
        }
    }

    var showAddDishDialog by remember { mutableStateOf(false) }
    var newDishName by remember { mutableStateOf("") }
    var newDishDesc by remember { mutableStateOf("") }
    var isVeg by remember { mutableStateOf(true) }
    var isNonVeg by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // 7-Day Date Selector Tab Row
        ScrollableTabRow(
            selectedTabIndex = selectedDateIndex,
            edgePadding = 12.dp,
            containerColor = MaterialTheme.colorScheme.surface
        ) {
            weekDates.forEachIndexed { index, pair ->
                Tab(
                    selected = selectedDateIndex == index,
                    onClick = { selectedDateIndex = index },
                    text = {
                        Text(
                            text = pair.second,
                            maxLines = 1,
                            softWrap = false,
                            style = MaterialTheme.typography.labelMedium.copy(
                                fontWeight = if (selectedDateIndex == index) FontWeight.Bold else FontWeight.Medium,
                                fontSize = 12.5.sp
                            )
                        )
                    }
                )
            }
        }

        // Meal Period Tabs
        TabRow(selectedTabIndex = selectedMealIndex) {
            MealType.values().forEachIndexed { index, meal ->
                Tab(
                    selected = selectedMealIndex == index,
                    onClick = { selectedMealIndex = index },
                    text = { Text(meal.displayName) }
                )
            }
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Managing ${selectedMeal.displayName} Menu",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = "Date: $selectedDateLabel ($selectedDate)",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }

                    Button(onClick = { showAddDishDialog = true }) {
                        Icon(Icons.Filled.Add, contentDescription = null)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Add Dish")
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
            }

            if (dishes.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 12.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "No dishes added yet for this meal slot.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Tap '+ Add Dish' above to create custom menu items.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }

            items(dishes) { dish ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            VegNonVegBadge(isVeg = dish.isVeg, isNonVeg = dish.isNonVeg)
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = dish.name,
                                    style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold)
                                )
                                if (dish.description.isNotBlank()) {
                                    Text(
                                        text = dish.description,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = if (dish.isAvailable) "Available" else "Stock Out",
                                style = MaterialTheme.typography.labelSmall
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Switch(
                                checked = dish.isAvailable,
                                onCheckedChange = {
                                    inchargeViewModel.toggleDishAvailability(selectedDate, selectedMeal, dish.id, effectiveMessId)
                                }
                            )
                            IconButton(onClick = { dishes.remove(dish) }) {
                                Icon(Icons.Filled.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
                            }
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick = {
                        inchargeViewModel.saveOrUpdateMenu(
                            date = selectedDate,
                            mealType = selectedMeal,
                            dishes = dishes.toList(),
                            isPublished = true,
                            updatedBy = inchargeName,
                            messId = effectiveMessId
                        )
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Publish Menu Updates to Students & Admin", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
                }
            }
        }
    }

    if (showAddDishDialog) {
        AlertDialog(
            onDismissRequest = { showAddDishDialog = false },
            title = { Text("Add Dish to ${selectedMeal.displayName}") },
            text = {
                Column {
                    OutlinedTextField(
                        value = newDishName,
                        onValueChange = { newDishName = it },
                        label = { Text("Dish Name") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = newDishDesc,
                        onValueChange = { newDishDesc = it },
                        label = { Text("Description / Preparation details") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = isVeg, onCheckedChange = { isVeg = it; if (it) isNonVeg = false })
                        Text("Vegetarian")
                        Spacer(modifier = Modifier.width(16.dp))
                        Checkbox(checked = isNonVeg, onCheckedChange = { isNonVeg = it; if (it) isVeg = false })
                        Text("Non-Veg")
                    }
                }
            },
            confirmButton = {
                Button(onClick = {
                    if (newDishName.isNotBlank()) {
                        dishes.add(
                            DishItem(
                                name = newDishName,
                                description = newDishDesc,
                                isVeg = isVeg,
                                isNonVeg = isNonVeg
                            )
                        )
                        newDishName = ""
                        newDishDesc = ""
                        showAddDishDialog = false
                    }
                }) {
                    Text("Add Dish")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddDishDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
