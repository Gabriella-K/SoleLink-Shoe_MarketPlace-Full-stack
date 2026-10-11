package rw.ac.auca.shoemarketplacesystembackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.ac.auca.shoemarketplacesystembackend.domain.Buyer;
import java.util.*;

@Repository
public interface BuyerRepository extends JpaRepository<Buyer, UUID> {

    Optional<Buyer> findByEmail(String email);

    boolean existsByEmail(String email);
}
