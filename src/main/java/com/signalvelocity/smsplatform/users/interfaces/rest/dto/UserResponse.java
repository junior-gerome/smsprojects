package com.signalvelocity.smsplatform.users.interfaces.rest.dto;

import com.signalvelocity.smsplatform.users.domain.model.User;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String fullName,
        String email,
        boolean enabled,
        Set<String> roles,
        LocalDateTime createdAt
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.isEnabled(),
                user.getRoles().stream().map(role -> role.getName().name()).collect(java.util.stream.Collectors.toSet()),
                user.getCreatedAt()
        );
    }
}
