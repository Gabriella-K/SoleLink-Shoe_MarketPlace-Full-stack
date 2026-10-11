package rw.ac.auca.shoemarketplacesystembackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.ac.auca.shoemarketplacesystembackend.domain.Shoe;
import java.util.*;

@Repository
public interface ShoeRepository extends JpaRepository<Shoe, UUID> {

    List<Shoe> findByVendorId(UUID vendorId);

    List<Shoe> findByCategoryId(UUID categoryId);

    boolean existsByCategoryId(UUID categoryId);
    boolean existsByVendorId(UUID vendorId);
}
