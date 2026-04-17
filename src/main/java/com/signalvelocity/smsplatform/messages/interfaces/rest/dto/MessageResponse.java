package com.signalvelocity.smsplatform.messages.interfaces.rest.dto;

import com.signalvelocity.smsplatform.messages.domain.model.Message;
import java.time.LocalDateTime;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        String status,
        String recipientPhoneNumber,
        String providerName,
        String providerMessageId,
        UUID contactId,
        UUID campaignId,
        LocalDateTime createdAt
) {

    public static MessageResponse from(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getStatus().name(),
                message.getRecipientPhoneNumber(),
                message.getProviderName(),
                message.getProviderMessageId(),
                message.getContact().getId(),
                message.getCampaign() != null ? message.getCampaign().getId() : null,
                message.getCreatedAt()
        );
    }
}
