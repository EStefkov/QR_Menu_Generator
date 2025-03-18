package com.example.qr_menu.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "allergen")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Allergen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "allergen_name", nullable = false)
    private String allergenName;

    @ManyToMany(mappedBy = "allergens")
    private Set<Product> products = new HashSet<>();
}
