package com.signalvelocity.smsplatform.messages.interfaces.rest.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ApiCredentialStatusResponse(
        String id,
        String label,
        List<String> scopes,
        LocalDateTime lastUsedAt,
        String status
) {
}
