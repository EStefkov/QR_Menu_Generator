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

    @Column(name = "updated_by")
    private Long updatedBy;

    // One Account can have many Restaurants
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Restorant> restorants;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Favorite> favorites = new HashSet<>();
    
    // Restaurants managed by this account (if it's a manager)
    @OneToMany(mappedBy = "manager", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ManagerAssignment> managedRestaurants = new HashSet<>();

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

    // Helper methods for managers
    public List<Restorant> getManagedRestaurants() {
        if (accountType != AccountType.ROLE_MANAGER && accountType != AccountType.ROLE_COMANAGER) {
            return List.of();
        }
        return managedRestaurants.stream()
                .map(ManagerAssignment::getRestorant)
                .toList();
    }
    
    public boolean managesRestaurant(Long restaurantId) {
        // Both ROLE_MANAGER and ROLE_COMANAGER can manage their assigned restaurants
        if (accountType != AccountType.ROLE_MANAGER && accountType != AccountType.ROLE_COMANAGER) {
            return false;
        }
        
        // Check if manager has a ManagerAssignment for this restaurant
        boolean hasAssignment = managedRestaurants.stream()
                .anyMatch(assignment -> assignment.getRestorant().getId().equals(restaurantId));
        
        if (hasAssignment) {
            return true;
        }
        
        // Also check if the manager created/owns this restaurant
        if (restorants != null) {
            return restorants.stream()
                    .anyMatch(restaurant -> restaurant.getId().equals(restaurantId));
        }
        
        return false;
    }

    public enum AccountType {
        ROLE_USER,
        ROLE_ADMIN,
        ROLE_MANAGER,
        ROLE_COMANAGER
    }
}
