package com.example.qr_menu.entities;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

@Entity
@Getter
@Setter
@ToString(exclude = {"restorants", "favorites"})
@EqualsAndHashCode(exclude = {"restorants", "favorites"})
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "account")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_name", nullable = false)
    private String accountName;

    @Column(name = "mail_address")
    private String mailAddress;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "profile_picture")
    private String profilePicture; // URL or path to the profile picture

    @Column(name = "number")
    private String number;

    @Column(name = "password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private AccountType accountType;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;


    // One Account can have many Restaurants
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Restorant> restorants;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Favorite> favorites = new HashSet<>();

    // Add helper methods for favorites
    public void addFavorite(Product product) {
        Favorite favorite = new Favorite();
        favorite.setAccount(this);
        favorite.setProduct(product);
        favorites.add(favorite);
    }

    public void removeFavorite(Product product) {
        favorites.removeIf(favorite -> favorite.getProduct().equals(product));
    }

    public enum AccountType {
        ROLE_USER,
        ROLE_ADMIN,
        ROLE_WAITER
    }
}
