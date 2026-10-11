package rw.ac.auca.shoemarketplacesystembackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import rw.ac.auca.shoemarketplacesystembackend.domain.*;
import rw.ac.auca.shoemarketplacesystembackend.repository.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private static final int DELIVERY_FEE = 2500;

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final BuyerRepository buyerRepository;

    public Order placeOrder(UUID buyerId, Order request) {
        if (isBlank(request.getCustomerName()) || isBlank(request.getPhone())
                || isBlank(request.getAddress())) {
            throw bad(HttpStatus.BAD_REQUEST, "Name, phone and delivery address are required");
        }

        Buyer buyer = buyerRepository.findById(buyerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Buyer not found"));
        Cart cart = cartRepository.findByBuyerId(buyerId)
                .orElseThrow(() -> bad(HttpStatus.BAD_REQUEST, "Your bag is empty"));
        if (cart.getItems().isEmpty()) {
            throw bad(HttpStatus.BAD_REQUEST, "Your bag is empty");
        }

        // Step 1: check every item BEFORE changing anything
        for (CartItem item : cart.getItems()) {
            ShoeStock stock = item.getShoe().findStock(item.getSize());
            int available = stock == null ? 0 : stock.getQuantity();
            if (available < item.getQuantity()) {
                throw bad(HttpStatus.CONFLICT, "Not enough stock for " + item.getShoe().getName()
                        + " in size " + item.getSize() + " (only " + available + " left)");
            }
        }

        // Step 2: build the order, copy the item details, subtract the stock
        Order order = new Order();
        order.setBuyer(buyer);
        order.setOrderNumber(generateOrderNumber());
        order.setStatus(OrderStatus.PENDING);
        order.setCustomerName(request.getCustomerName());
        order.setPhone(request.getPhone());
        order.setDistrict(request.getDistrict());
        order.setAddress(request.getAddress());
        order.setDeliveryNotes(request.getDeliveryNotes());

        int subtotal = 0;
        for (CartItem item : cart.getItems()) {
            Shoe shoe = item.getShoe();

            ShoeStock stock = shoe.findStock(item.getSize());
            stock.setQuantity(stock.getQuantity() - item.getQuantity());

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setShoe(shoe);
            orderItem.setVendor(shoe.getVendor());
            orderItem.setShoeName(shoe.getName());
            orderItem.setBrand(shoe.getBrand());
            orderItem.setImage(shoe.getImages().isEmpty() ? null : shoe.getImages().get(0));
            orderItem.setSize(item.getSize());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(shoe.getPrice());
            order.getItems().add(orderItem);

            subtotal += shoe.getPrice() * item.getQuantity();
        }
        order.setSubtotal(subtotal);
        order.setDeliveryFee(DELIVERY_FEE);
        order.setTotal(subtotal + DELIVERY_FEE);

        // Step 3: empty the cart and save the order
        cart.getItems().clear();
        return orderRepository.save(order);
    }

    public Order getByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    public Order getForUser(String orderNumber, TokenStore.Session session) {
        Order order = getByOrderNumber(orderNumber);
        boolean allowed = session.role() == Role.BUYER
                ? order.getBuyer().getId().equals(session.userId())
                : containsVendor(order, session.userId());
        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized to view this order");
        }
        return order;
    }

    public List<Order> getForBuyer(UUID buyerId) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
    }

    public List<Order> getForVendor(UUID vendorId) {
        return orderRepository.findDistinctByItemsVendorIdOrderByCreatedAtDesc(vendorId);
    }

    public Order updateStatus(String orderNumber, UUID vendorId, OrderStatus newStatus, String rejectReason) {
        Order order = getByOrderNumber(orderNumber);
        if (!containsVendor(order, vendorId)) {
            throw bad(HttpStatus.FORBIDDEN, "Order does not contain your items");
        }

        OrderStatus current = order.getStatus();
        if (current == OrderStatus.COMPLETED || current == OrderStatus.REJECTED
                || current == OrderStatus.CANCELLED) {
            throw bad(HttpStatus.CONFLICT, "This order is already closed");
        }

        if (newStatus == OrderStatus.REJECTED) {
            if (isBlank(rejectReason)) {
                throw bad(HttpStatus.BAD_REQUEST, "A reason is required when rejecting an order");
            }
            order.setRejectReason(rejectReason);
        }

        // a rejected or cancelled order gives the shoes back
        if (newStatus == OrderStatus.REJECTED || newStatus == OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                ShoeStock stock = item.getShoe().findStock(item.getSize());
                if (stock != null) {
                    stock.setQuantity(stock.getQuantity() + item.getQuantity());
                }
            }
        }

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    // ---------- helpers ----------

    private boolean containsVendor(Order order, UUID vendorId) {
        for (OrderItem item : order.getItems()) {
            if (item.getVendor().getId().equals(vendorId)) {
                return true;
            }
        }
        return false;
    }

    private String generateOrderNumber() {
        String number;
        do {
            number = "SL-" + LocalDate.now().getYear() + "-" + (1000 + new Random().nextInt(9000));
        } while (orderRepository.findByOrderNumber(number).isPresent());
        return number;
    }

    private boolean isBlank(String text) {
        return text == null || text.isBlank();
    }

    private ResponseStatusException bad(HttpStatus status, String message) {
        return new ResponseStatusException(status, message);
    }
}