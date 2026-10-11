package rw.ac.auca.shoemarketplacesystembackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.ac.auca.shoemarketplacesystembackend.domain.Vendor;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, UUID> {

    Optional<Vendor> findByEmail(String email);

    boolean existsByEmail(String email);
}