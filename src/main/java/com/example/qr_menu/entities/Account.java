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
@Table(name = "account")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_name")
    private String accountName;

    @Column(name = "mail_address")
    private String mailAddress;

    @Column(name = "number")
    private String number;

    @Column(name = "password", nullable = false)
    private String password;

    // Enum to store account types (USER or ADMIN)
    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private AccountType accountType;

    // One Account can have many Restaurants
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Restorant> restorants;

    // Enum definition
    public enum AccountType {
        USER,
        ADMIN
    }
}
