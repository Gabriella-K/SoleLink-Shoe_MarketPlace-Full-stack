package rw.ac.auca.shoemarketplacesystembackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import rw.ac.auca.shoemarketplacesystembackend.domain.*;
import rw.ac.auca.shoemarketplacesystembackend.repository.BuyerRepository;
import rw.ac.auca.shoemarketplacesystembackend.repository.CartRepository;
import rw.ac.auca.shoemarketplacesystembackend.repository.ShoeRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final BuyerRepository buyerRepository;
    private final ShoeRepository shoeRepository;

    public Cart getCart(UUID buyerId) {
        return cartRepository.findByBuyerId(buyerId)
                .orElseGet(() -> createCart(buyerId));
    }

    public Cart addItem(UUID buyerId, UUID shoeId, int size, int quantity) {
        if (quantity <= 0) {
            throw bad("Quantity must be at least 1");
        }
        Cart cart = getCart(buyerId);
        Shoe shoe = shoeRepository.findById(shoeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shoe not found"));

        int available = availableStock(shoe, size);
        if (available <= 0) {
            throw bad("Size " + size + " is currently out of stock");
        }

        CartItem item = findItem(cart, shoeId, size);
        int newQuantity = (item == null ? 0 : item.getQuantity()) + quantity;
        if (newQuantity > available) {
            throw bad("Cannot add more than available stock (" + available + " pairs)");
        }

        if (item == null) {
            item = new CartItem();
            item.setCart(cart);
            item.setShoe(shoe);
            item.setSize(size);
            cart.getItems().add(item);
        }
        item.setQuantity(newQuantity);
        return cartRepository.save(cart);
    }

    public Cart changeQuantity(UUID buyerId, UUID itemId, int delta) {
        Cart cart = getCart(buyerId);
        CartItem item = findItemById(cart, itemId);

        int newQuantity = item.getQuantity() + delta;
        if (newQuantity <= 0) {
            cart.getItems().remove(item);
        } else {
            int available = availableStock(item.getShoe(), item.getSize());
            if (newQuantity > available) {
                throw bad("Only " + available + " pairs available");
            }
            item.setQuantity(newQuantity);
        }
        return cartRepository.save(cart);
    }

    public Cart removeItem(UUID buyerId, UUID itemId) {
        Cart cart = getCart(buyerId);
        cart.getItems().remove(findItemById(cart, itemId));
        return cartRepository.save(cart);
    }

    public Cart clear(UUID buyerId) {
        Cart cart = getCart(buyerId);
        cart.getItems().clear();
        return cartRepository.save(cart);
    }

    // ---------- helpers ----------

    private Cart createCart(UUID buyerId) {
        Buyer buyer = buyerRepository.findById(buyerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Buyer not found"));
        Cart cart = new Cart();
        cart.setBuyer(buyer);
        return cartRepository.save(cart);
    }

    private int availableStock(Shoe shoe, int size) {
        ShoeStock stock = shoe.findStock(size);
        return stock == null ? 0 : stock.getQuantity();
    }

    private CartItem findItem(Cart cart, UUID shoeId, int size) {
        for (CartItem item : cart.getItems()) {
            if (item.getShoe().getId().equals(shoeId) && item.getSize() == size) {
                return item;
            }
        }
        return null;
    }

    private CartItem findItemById(Cart cart, UUID itemId) {
        for (CartItem item : cart.getItems()) {
            if (item.getId().equals(itemId)) {
                return item;
            }
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found");
    }

    private ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
