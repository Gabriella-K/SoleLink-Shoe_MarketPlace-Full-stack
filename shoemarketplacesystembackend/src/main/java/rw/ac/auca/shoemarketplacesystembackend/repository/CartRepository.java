package rw.ac.auca.shoemarketplacesystembackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.ac.auca.shoemarketplacesystembackend.domain.Cart;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {

    Optional<Cart> findByBuyerId(UUID buyerId);
}