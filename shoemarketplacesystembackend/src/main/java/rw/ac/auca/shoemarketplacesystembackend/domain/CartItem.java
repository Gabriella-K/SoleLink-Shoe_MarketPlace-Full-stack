package rw.ac.auca.shoemarketplacesystembackend.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import rw.ac.auca.shoemarketplacesystembackend.base.BaseEntity;


@Entity
@Table(name = "cart_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CartItem extends BaseEntity {

    @Column(nullable = false)
    private int size;

    @Column(nullable = false)
    private int quantity;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "cart_id")
    private Cart cart;

    @ManyToOne(optional = false)
    @JoinColumn(name = "shoe_id")
    private Shoe shoe;
}
