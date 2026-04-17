package com.signalvelocity.smsplatform.messages.domain.service;

import com.signalvelocity.smsplatform.messages.domain.model.MessageStatus;

public record SmsGatewayResult(
        String providerName,
        String providerMessageId,
        MessageStatus initialStatus,
        String errorMessage
) {
}
