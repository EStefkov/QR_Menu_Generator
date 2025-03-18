package com.example.qr_menu.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "restorant")
public class Restorant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "restorant_name")
    private String restorantName;

    @Column(name = "phone_number")
    private String phoneNumber;

    // Many Restorants can belong to one Account
    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(name = "address") // New column for address
    private String address;

    @Column(name = "email")
    private String email;


    // One Restorant can have many Menus
    @OneToMany(mappedBy = "restorant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Menu> menus;
}
