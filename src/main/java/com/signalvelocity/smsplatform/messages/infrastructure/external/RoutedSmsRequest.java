package com.signalvelocity.smsplatform.messages.infrastructure.external;

public record RoutedSmsRequest(
        String providerId,
        String operatorKey,
        String rawPhoneNumber,
        String normalizedPhoneNumber,
        String content,
        String senderId
) {
}
