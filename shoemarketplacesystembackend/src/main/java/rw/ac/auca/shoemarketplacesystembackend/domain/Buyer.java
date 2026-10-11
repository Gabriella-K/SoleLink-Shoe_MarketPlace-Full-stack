package rw.ac.auca.shoemarketplacesystembackend.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import rw.ac.auca.shoemarketplacesystembackend.base.BaseEntity;
import java.util.*;


@Entity
@Table(name = "buyers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Buyer extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 100)
    private String district;
    private String address;
    private String avatar;

    @JsonIgnore
    @OneToMany(mappedBy = "buyer")
    private List<Order> orders = new ArrayList<>();
}
