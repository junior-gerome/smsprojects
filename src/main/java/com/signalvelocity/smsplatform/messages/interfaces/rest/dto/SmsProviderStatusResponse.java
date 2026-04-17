package com.signalvelocity.smsplatform.messages.interfaces.rest.dto;

import java.util.List;

public record SmsProviderStatusResponse(
        String providerId,
        boolean enabled,
        String mode,
        boolean defaultProvider,
        boolean fallbackProvider,
        String senderId,
        String senderAddress,
        boolean authConfigured,
        boolean sendUrlConfigured,
        boolean credentialsConfigured,
        List<String> routedOperators
) {
}
