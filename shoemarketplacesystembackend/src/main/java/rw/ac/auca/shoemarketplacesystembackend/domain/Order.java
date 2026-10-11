package rw.ac.auca.shoemarketplacesystembackend.domain;

import jakarta.persistence.*;
import lombok.*;
import rw.ac.auca.shoemarketplacesystembackend.base.BaseEntity;
import java.util.*;

@Entity
@Table(name = "orders")   // "order" is a reserved SQL word, so we use "orders"
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Order extends BaseEntity {

    @Column(nullable = false, unique = true, length = 30)
    private String orderNumber;        // e.g. SL-2026-8910, shown in the UI

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    private String customerName;
    private String phone;
    private String district;
    private String address;
    private String deliveryNotes;
    private String rejectReason;

    private int subtotal;
    private int deliveryFee;
    private int total;

    @ManyToOne(optional = false)
    @JoinColumn(name = "buyer_id")
    private Buyer buyer;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
}