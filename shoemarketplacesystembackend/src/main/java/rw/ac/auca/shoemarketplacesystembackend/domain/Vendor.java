package rw.ac.auca.shoemarketplacesystembackend.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import rw.ac.auca.shoemarketplacesystembackend.base.BaseEntity;
import java.util.*;

@Entity
@Table(name = "vendors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Vendor extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String ownerName;

    @Column(nullable = false, length = 100)
    private String name;            // the shop name (the frontend calls it "name")

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 150)
    private String tagline;

    private String logo;
    private String coverImage;

    @Column(nullable = false, length = 100)
    private String location;        // e.g. "Kigali Heights, Level 1"

    @Column(length = 100)
    private String district;
    private String address;
    private String openingHours;

    @Column(length = 1000)
    private String about;

    private boolean verified;
    private double rating;
    private int reviewCount;

    @JsonIgnore
    @OneToMany(mappedBy = "vendor")
    private List<Shoe> shoes = new ArrayList<>();

}
