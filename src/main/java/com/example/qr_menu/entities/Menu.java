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


    // One Menu can have many Products
    @OneToMany(mappedBy = "menu", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Product> products;
}
