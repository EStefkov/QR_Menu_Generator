package com.example.qr_menu.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "menu")
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category")
    private String category;

    @Column(name = "created_at")
    @Temporal(TemporalType.DATE)
    private Date createdAt;

    @Column(name= "updated_at")
    @Temporal(TemporalType.DATE)

    private Date updatedAt;
    // Many Menus can belong to one Restorant

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restorant_id",nullable = false) // Foreign key column in Menu table
    private Restorant restorant;

    @Column(name = "menu_url")
    private String menuUrl;

    @Lob
    @Column(name = "qr_code_image", columnDefinition = "BLOB")
    private byte[] qrCodeImage;

    @Column(
            name = "menu_image",
            columnDefinition = "VARCHAR(255) DEFAULT 'default_menu.png'"
    )
    private String menuImage;

    // One Menu can have many Products
    @OneToMany(mappedBy = "menu", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Product> products;

    @OneToMany(mappedBy = "menu", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Category> categories;



}
