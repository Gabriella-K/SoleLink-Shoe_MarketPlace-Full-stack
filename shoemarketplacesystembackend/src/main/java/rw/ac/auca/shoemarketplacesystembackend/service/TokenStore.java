package rw.ac.auca.shoemarketplacesystembackend.service;

import org.springframework.stereotype.Component;
import rw.ac.auca.shoemarketplacesystembackend.domain.Role;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenStore {

    public record Session(UUID userId, Role role) {}

    private final Map<String, Session> sessions = new ConcurrentHashMap<>();

    public String create(UUID userId, Role role) {
        String token = UUID.randomUUID().toString();
        sessions.put(token, new Session(userId, role));
        return token;
    }

    public Session find(String token) {
        return sessions.get(token);
    }

    public void remove(String token) {
        sessions.remove(token);
    }
}