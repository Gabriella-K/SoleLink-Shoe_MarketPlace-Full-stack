package rw.ac.auca.shoemarketplacesystembackend.domain;

import jakarta.persistence.*;
import lombok.*;
import rw.ac.auca.shoemarketplacesystembackend.base.BaseEntity;
import java.util.*;

@Entity
@Table(name = "shoes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Shoe extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String brand;

    @Column(nullable = false)
    private int price;                 // RWF has no cents, so int is exact

    private Integer originalPrice;     // Integer (not int) so it can be null

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShoeCondition condition;

    private String color;
    private String material;

    @Column(length = 1000)
    private String description;

    private double rating;
    private int reviewCount;
    private boolean bestSeller;
    private boolean featured;

    @ManyToOne(optional = false)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @ManyToOne(optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "shoe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShoeStock> stocks = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "shoe_images", joinColumns = @JoinColumn(name = "shoe_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    public ShoeStock findStock(int size) {
        for (ShoeStock stock : stocks) {
            if (stock.getSize() == size) {
                return stock;
            }
        }
        return null;
    }
}
