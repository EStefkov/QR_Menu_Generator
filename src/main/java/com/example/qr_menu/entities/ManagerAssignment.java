package com.example.qr_menu.entities;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "manager_assignment")
public class ManagerAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id", nullable = false)
    private Account manager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restorant_id", nullable = false)
    private Restorant restorant;

    @Column(name = "assigned_at")
    private Timestamp assignedAt;
    
    @Column(name = "assigned_by")
    private Long assignedBy; // ID of the admin who assigned the manager
} 