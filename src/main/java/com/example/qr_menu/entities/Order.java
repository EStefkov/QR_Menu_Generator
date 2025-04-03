package com.example.qr_menu.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.Set;

@Entity
@Getter
@Setter
@ToString(exclude = {"orderProducts"})
@EqualsAndHashCode(exclude = {"orderProducts"})
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "order_time", nullable = false)
    private Date orderTime = new Date();

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    private OrderStatus orderStatus = OrderStatus.PENDING;

    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    @JsonBackReference
    private Account account;

    @ManyToOne
    @JoinColumn(name = "restorant_id", nullable = false)
    @JsonBackReference
    private Restorant restorant;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<OrderProduct> orderProducts;

    public enum OrderStatus {
        PENDING,
        PREPARING,
        READY,
        DELIVERED,
        CANCELLED,
        FINISHED,
        ACCEPTED
    }
}
