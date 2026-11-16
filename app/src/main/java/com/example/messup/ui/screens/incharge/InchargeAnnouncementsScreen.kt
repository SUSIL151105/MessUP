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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.messup.data.model.NoticePriority
import com.example.messup.ui.viewmodel.AuthViewModel
import com.example.messup.ui.viewmodel.InchargeViewModel

@Composable
fun InchargeAnnouncementsScreen(
    inchargeViewModel: InchargeViewModel,
    authViewModel: AuthViewModel? = null
) {
    val userProfile by authViewModel?.currentUserProfile?.collectAsState() ?: remember { mutableStateOf(null) }
    val inchargeName = userProfile?.name?.ifBlank { "Food Incharge" } ?: "Food Incharge"
    val inchargeMessId = userProfile?.messId?.ifBlank { "MESS_001" } ?: "MESS_001"
    val inchargeMessName = userProfile?.messName?.ifBlank { "Central Dining Hall" } ?: "Central Dining Hall"

    val announcements by inchargeViewModel.announcements.collectAsState()

    var title by remember { mutableStateOf("") }
    var content by remember { mutableStateOf("") }
    var priority by remember { mutableStateOf(NoticePriority.NORMAL) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        Text(
            text = "Post Mess Announcement",
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
        )
        Text(
            text = "Broadcasting for: $inchargeMessName",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.primary
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Notice Title") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = content,
            onValueChange = { content = it },
            label = { Text("Notice Description / Content") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3
        )

        Spacer(modifier = Modifier.height(12.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            if (priority == NoticePriority.NORMAL) {
                Button(
                    onClick = { priority = NoticePriority.NORMAL },
                    shape = RoundedCornerShape(8.dp)
                ) { Text("Normal") }
            } else {
                OutlinedButton(
                    onClick = { priority = NoticePriority.NORMAL },
                    shape = RoundedCornerShape(8.dp)
                ) { Text("Normal") }
            }

            if (priority == NoticePriority.IMPORTANT) {
                Button(
                    onClick = { priority = NoticePriority.IMPORTANT },
                    shape = RoundedCornerShape(8.dp)
                ) { Text("Important") }
            } else {
                OutlinedButton(
                    onClick = { priority = NoticePriority.IMPORTANT },
                    shape = RoundedCornerShape(8.dp)
                ) { Text("Important") }
            }

            if (priority == NoticePriority.URGENT) {
                Button(
                    onClick = { priority = NoticePriority.URGENT },
                    shape = RoundedCornerShape(8.dp)
                ) { Text("Urgent") }
            } else {
                OutlinedButton(
                    onClick = { priority = NoticePriority.URGENT },
                    shape = RoundedCornerShape(8.dp)
                ) { Text("Urgent") }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = {
                if (title.isNotBlank() && content.isNotBlank()) {
                    inchargeViewModel.postAnnouncement(
                        title = title, 
                        content = content, 
                        priority = priority,
                        createdByName = inchargeName,
                        messId = inchargeMessId
                    )
                    title = ""
                    content = ""
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text("Publish Announcement", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Published Announcements (${announcements.size})",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
        )

        Spacer(modifier = Modifier.height(8.dp))

        LazyColumn {
            items(announcements) { notice ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = notice.title,
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                            )
                            Text(
                                text = notice.priority.displayName,
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = notice.content,
                            style = MaterialTheme.typography.bodyMedium
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = "Posted by: ${notice.createdByName.ifBlank { "Central Mess Office" }}",
                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp),
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}
