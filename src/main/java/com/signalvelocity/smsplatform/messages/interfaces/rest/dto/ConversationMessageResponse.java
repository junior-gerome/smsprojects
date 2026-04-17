package com.signalvelocity.smsplatform.messages.interfaces.rest.dto;

import com.signalvelocity.smsplatform.messages.domain.model.Message;
import com.signalvelocity.smsplatform.messages.domain.model.MessageDirection;
import java.time.LocalDateTime;
import java.util.UUID;

public record ConversationMessageResponse(
        UUID id,
        String author,
        String content,
        String status,
        LocalDateTime createdAt
) {

    public static ConversationMessageResponse from(Message message) {
        return new ConversationMessageResponse(
                message.getId(),
                message.getDirection() == MessageDirection.OUTBOUND ? "agent" : "contact",
                message.getContent(),
                message.getStatus().name(),
                message.getCreatedAt()
        );
    }
}
