package com.example.messup.ui.screens.incharge

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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.messup.data.model.ComplaintStatus
import com.example.messup.data.model.FeedbackComplaint
import com.example.messup.ui.components.ComplaintStatusBadge
import com.example.messup.ui.viewmodel.AuthViewModel
import com.example.messup.ui.viewmodel.InchargeViewModel

@Composable
fun InchargeFeedbackInboxScreen(
    inchargeViewModel: InchargeViewModel,
    authViewModel: AuthViewModel? = null
) {
    val userProfile by authViewModel?.currentUserProfile?.collectAsState() ?: remember { mutableStateOf(null) }
    val inchargeName = userProfile?.name?.ifBlank { "Food Incharge" } ?: "Food Incharge"
    val inchargeMessId = userProfile?.messId?.ifBlank { "MESS_001" } ?: "MESS_001"

    val complaints by inchargeViewModel.complaints.collectAsState()

    var selectedTabIndex by remember { mutableIntStateOf(0) }
    // 0: All, 1: My Mess, 2: Submitted, 3: Under Review, 4: Action Planned, 5: Resolved
    val filteredList = when (selectedTabIndex) {
        0 -> complaints
        1 -> complaints.filter { it.messId.isBlank() || it.messId == inchargeMessId || it.assignedToInchargeId == userProfile?.uid }
        2 -> complaints.filter { it.status == ComplaintStatus.SUBMITTED }
        3 -> complaints.filter { it.status == ComplaintStatus.UNDER_REVIEW }
        4 -> complaints.filter { it.status == ComplaintStatus.ACTION_PLANNED }
        5 -> complaints.filter { it.status == ComplaintStatus.RESOLVED }
        else -> complaints
    }

    var respondingComplaint by remember { mutableStateOf<FeedbackComplaint?>(null) }
    var responseMessage by remember { mutableStateOf("") }
    var newStatus by remember { mutableStateOf(ComplaintStatus.UNDER_REVIEW) }

    val tabTitles = listOf("All (${complaints.size})", "My Mess", "Submitted", "Under Review", "Action Planned", "Resolved")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        ScrollableTabRow(
            selectedTabIndex = selectedTabIndex,
            edgePadding = 12.dp,
            containerColor = MaterialTheme.colorScheme.surface
        ) {
            tabTitles.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTabIndex == index,
                    onClick = { selectedTabIndex = index },
                    text = {
                        Text(
                            text = title,
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
            items(filteredList) { complaint ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = complaint.category.displayName,
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                            )
                            ComplaintStatusBadge(status = complaint.status)
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = "Submitted by: ${if (complaint.isPrivate) "Anonymous Student" else complaint.studentName}",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.primary
                        )

                        if (!complaint.gpsLocationTag.isNullOrBlank() || !complaint.photoUrl.isNullOrBlank()) {
                            Spacer(modifier = Modifier.height(6.dp))
                            Surface(
                                color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.45f),
                                shape = RoundedCornerShape(8.dp),
                                border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.25f))
                            ) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            imageVector = Icons.Filled.Verified,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.primary,
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = "Compulsory GPS Photo Evidence Verified",
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                            color = MaterialTheme.colorScheme.primary
                                        )
                                    }
                                    if (!complaint.gpsLocationTag.isNullOrBlank()) {
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = complaint.gpsLocationTag!!,
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onPrimaryContainer
                                        )
                                    }
                                    if (!complaint.photoUrl.isNullOrBlank()) {
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(
                                            text = "Photo Evidence Reference: ${complaint.photoUrl}",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = complaint.description,
                            style = MaterialTheme.typography.bodyMedium
                        )

                        if (!complaint.officialResponse.isNullOrBlank()) {
                            Spacer(modifier = Modifier.height(10.dp))
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.5f))
                            ) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Text(
                                        text = "Official Response (${complaint.respondedBy ?: "Mess Incharge"}):",
                                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold)
                                    )
                                    Text(
                                        text = complaint.officialResponse ?: "",
                                        style = MaterialTheme.typography.bodySmall
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Button(
                            onClick = {
                                respondingComplaint = complaint
                                responseMessage = complaint.officialResponse ?: ""
                                newStatus = complaint.status
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Reply & Change Status")
                        }
                    }
                }
            }
        }
    }

    if (respondingComplaint != null) {
        val target = respondingComplaint!!
        AlertDialog(
            onDismissRequest = { respondingComplaint = null },
            title = { Text("Respond to Complaint #${target.id.takeLast(4)}") },
            text = {
                Column {
                    Text(
                        text = "Category: ${target.category.displayName}",
                        style = MaterialTheme.typography.bodySmall
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = responseMessage,
                        onValueChange = { responseMessage = it },
                        label = { Text("Official Response Message") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("Update Status:", style = MaterialTheme.typography.labelMedium)
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        if (newStatus == ComplaintStatus.UNDER_REVIEW) {
                            Button(
                                onClick = { newStatus = ComplaintStatus.UNDER_REVIEW },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp)
                            ) { Text("Review", fontSize = 11.sp) }
                        } else {
                            OutlinedButton(
                                onClick = { newStatus = ComplaintStatus.UNDER_REVIEW },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp)
                            ) { Text("Review", fontSize = 11.sp) }
                        }

                        if (newStatus == ComplaintStatus.ACTION_PLANNED) {
                            Button(
                                onClick = { newStatus = ComplaintStatus.ACTION_PLANNED },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp)
                            ) { Text("Action", fontSize = 11.sp) }
                        } else {
                            OutlinedButton(
                                onClick = { newStatus = ComplaintStatus.ACTION_PLANNED },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp)
                            ) { Text("Action", fontSize = 11.sp) }
                        }

                        if (newStatus == ComplaintStatus.RESOLVED) {
                            Button(
                                onClick = { newStatus = ComplaintStatus.RESOLVED },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp)
                            ) { Text("Resolve", fontSize = 11.sp) }
                        } else {
                            OutlinedButton(
                                onClick = { newStatus = ComplaintStatus.RESOLVED },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp)
                            ) { Text("Resolve", fontSize = 11.sp) }
                        }
                    }
                }
            },
            confirmButton = {
                Button(onClick = {
                    inchargeViewModel.respondToComplaint(
                        complaintId = target.id, 
                        status = newStatus, 
                        responseText = responseMessage,
                        responderName = inchargeName
                    )
                    respondingComplaint = null
                }) {
                    Text("Save Response")
                }
            },
            dismissButton = {
                TextButton(onClick = { respondingComplaint = null }) {
                    Text("Cancel")
                }
            }
        )
    }
}
