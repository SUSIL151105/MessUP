package com.example.messup.ui.screens.student

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.messup.data.model.MealType
import com.example.messup.ui.components.FilterChipTag
import com.example.messup.ui.components.InteractiveRatingStars
import com.example.messup.ui.viewmodel.AuthViewModel
import com.example.messup.ui.viewmodel.RatingUiState
import com.example.messup.ui.viewmodel.StudentViewModel

@Composable
fun StudentRatingScreen(
    mealType: MealType,
    authViewModel: AuthViewModel,
    studentViewModel: StudentViewModel,
    onSubmitted: () -> Unit
) {
    val userProfile by authViewModel.currentUserProfile.collectAsState()
    val ratingState by studentViewModel.ratingState.collectAsState()

    var tasteRating by remember { mutableFloatStateOf(4f) }
    var qualityRating by remember { mutableFloatStateOf(4f) }
    var hygieneRating by remember { mutableFloatStateOf(5f) }
    var portionRating by remember { mutableFloatStateOf(4f) }
    var overallRating by remember { mutableFloatStateOf(4f) }

    var comment by remember { mutableStateOf("") }
    val selectedTags = remember { mutableStateListOf<String>() }

    val availableTags = remember {
        listOf(
            "Fresh food", "Good taste", "Sufficient portion", "Too spicy",
            "Cold food", "Good variety", "Clean dining", "Too salty", "Excellent meal"
        )
    }

    LaunchedEffect(ratingState) {
        when (ratingState) {
            is RatingUiState.Success -> {
                studentViewModel.resetRatingState()
                onSubmitted()
            }
            else -> {}
        }
    }

    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(horizontal = 18.dp, vertical = 12.dp)
            .verticalScroll(scrollState)
    ) {
        Text(
            text = "Rate ${mealType.displayName}",
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.onBackground
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Hero Overall Rating Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)),
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.2f))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(18.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "OVERALL RATING",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = 1.sp),
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(6.dp))
                InteractiveRatingStars(
                    rating = overallRating,
                    onRatingChanged = { overallRating = it },
                    starSize = 32.dp
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Detailed Dimensions
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Quality Breakdown",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                )

                Spacer(modifier = Modifier.height(10.dp))

                DimensionRatingRow("Taste & Flavor", tasteRating) { tasteRating = it }
                DimensionRatingRow("Food Quality", qualityRating) { qualityRating = it }
                DimensionRatingRow("Hygiene", hygieneRating) { hygieneRating = it }
                DimensionRatingRow("Portion Size", portionRating) { portionRating = it }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Tags
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Highlights",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                )

                Spacer(modifier = Modifier.height(10.dp))

                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    availableTags.chunked(3).forEach { rowTags ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            rowTags.forEach { tag ->
                                val isSelected = selectedTags.contains(tag)
                                FilterChipTag(
                                    label = tag,
                                    isSelected = isSelected,
                                    onClick = {
                                        if (isSelected) selectedTags.remove(tag) else selectedTags.add(tag)
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        OutlinedTextField(
            value = comment,
            onValueChange = { comment = it },
            label = { Text("Comment (Optional)") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            maxLines = 3
        )

        Spacer(modifier = Modifier.height(20.dp))

        Button(
            onClick = {
                if (ratingState !is RatingUiState.Submitting) {
                    studentViewModel.submitMealRating(
                        studentId = userProfile?.uid ?: "STU_DEFAULT",
                        studentName = userProfile?.name ?: "Student",
                        mealType = mealType,
                        taste = tasteRating,
                        quality = qualityRating,
                        hygiene = hygieneRating,
                        portion = portionRating,
                        overall = overallRating,
                        tags = selectedTags.toList(),
                        comment = comment,
                        messId = userProfile?.messId?.ifBlank { "MESS_001" } ?: "MESS_001"
                    )
                }
            },
            enabled = ratingState !is RatingUiState.Submitting,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text(
                text = if (ratingState is RatingUiState.Submitting) "Submitting Rating..." else "Submit Rating",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
            )
        }
    }
}

@Composable
private fun DimensionRatingRow(
    label: String,
    rating: Float,
    onRatingChanged: (Float) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.weight(1f)
        )
        InteractiveRatingStars(
            rating = rating,
            onRatingChanged = onRatingChanged,
            starSize = 18.dp
        )
    }
}
