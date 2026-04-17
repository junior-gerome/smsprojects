package com.signalvelocity.smsplatform.messages.interfaces.rest.dto;

import jakarta.validation.constraints.NotBlank;

public record DeliveryWebhookRequest(
        @NotBlank String providerMessageId,
        @NotBlank String status,
        String errorMessage
) {
}
