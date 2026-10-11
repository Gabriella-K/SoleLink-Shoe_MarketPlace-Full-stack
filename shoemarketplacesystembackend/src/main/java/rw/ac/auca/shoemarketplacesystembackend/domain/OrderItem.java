package rw.ac.auca.shoemarketplacesystembackend.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import rw.ac.auca.shoemarketplacesystembackend.base.BaseEntity;

@Entity
@Table(name = "order_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class OrderItem extends BaseEntity {

    private String shoeName;     // copied from the shoe at purchase time
    private String brand;
    private String image;
    private int size;
    private int quantity;
    private int price;           // price at purchase time

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(optional = false)
    @JoinColumn(name = "shoe_id")
    private Shoe shoe;

    @ManyToOne(optional = false)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;
}
