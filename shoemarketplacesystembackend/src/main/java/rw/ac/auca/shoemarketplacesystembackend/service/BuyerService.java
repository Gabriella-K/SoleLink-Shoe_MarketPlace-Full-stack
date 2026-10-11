package rw.ac.auca.shoemarketplacesystembackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import rw.ac.auca.shoemarketplacesystembackend.domain.Buyer;
import rw.ac.auca.shoemarketplacesystembackend.repository.BuyerRepository;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BuyerService {

    @Autowired
    private BuyerRepository buyerRepository;

    public Buyer getById(UUID id) {
        return buyerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Buyer not found"));
    }

    public Buyer create(Buyer buyer) {
        if (buyer.getFullName() == null || buyer.getFullName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full name is required");
        }
        if (buyer.getEmail() == null || !buyer.getEmail().contains("@")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A valid email is required");
        }
        if (buyer.getPassword() == null || buyer.getPassword().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters");
        }
        if (buyerRepository.existsByEmail(buyer.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        return buyerRepository.save(buyer);
    }
}