package com.signalvelocity.smsplatform.users.interfaces.rest.dto;

import java.time.Instant;

public record LoginResponse(
        String accessToken,
        String tokenType,
        Instant expiresAt,
        UserResponse user
) {
}
