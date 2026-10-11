package rw.ac.auca.shoemarketplacesystembackend.domain;

import jakarta.persistence.*;
import lombok.*;
import rw.ac.auca.shoemarketplacesystembackend.base.BaseEntity;
import java.util.*;

@Entity
@Table(name = "carts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Cart extends BaseEntity {

    @OneToOne(optional = false)
    @JoinColumn(name = "buyer_id", unique = true)
    private Buyer buyer;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> items = new ArrayList<>();
}
