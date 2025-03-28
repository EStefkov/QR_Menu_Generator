package com.example.qr_menu.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@ToString(exclude = {"menu", "category", "favorites", "allergens"})
@EqualsAndHashCode(exclude = {"menu", "category", "favorites", "allergens"})
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "product_price")
    private Double productPrice;

    @Column(name = "product_info")
    private String productInfo;

    @Column(
            name = "product_image"
    )
    private String productImage;

    // Many Products can belong to one Menu
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id")
    private Menu menu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "product_allergen",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "allergen_id")
    )
    private List<Allergen> allergens = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Favorite> favorites = new HashSet<>();

    // Add helper methods for favorites
    public void addFavorite(Account account) {
        Favorite favorite = new Favorite();
        favorite.setProduct(this);
        favorite.setAccount(account);
        favorites.add(favorite);
    }

    public void removeFavorite(Account account) {
        favorites.removeIf(favorite -> favorite.getAccount().equals(account));
    }
}
