package com.example.qr_menu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ManagerAssignmentDTO {
    private Long id;
    private Long managerId;
    private String managerName;
    private Long restaurantId;
    private String restaurantName;
    private Timestamp assignedAt;
    private Long assignedBy;
    private String assignedByName;
} 