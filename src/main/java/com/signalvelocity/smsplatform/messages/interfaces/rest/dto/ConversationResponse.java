package com.signalvelocity.smsplatform.messages.interfaces.rest.dto;

import com.signalvelocity.smsplatform.messages.domain.model.Conversation;
import com.signalvelocity.smsplatform.messages.domain.model.Message;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ConversationResponse(
        UUID id,
        UUID contactId,
        String contactName,
        String contactPhoneNumber,
        String initials,
        String preview,
        String status,
        LocalDateTime lastMessageAt,
        List<ConversationMessageResponse> messages
) {

    public static ConversationResponse from(Conversation conversation, List<Message> messages, String status) {
        return new ConversationResponse(
                conversation.getId(),
                conversation.getContact().getId(),
                conversation.getContact().getFullName(),
                conversation.getContact().getPhoneNumber(),
                extractInitials(conversation.getContact().getFullName()),
                conversation.getLastMessagePreview(),
                status,
                conversation.getLastMessageAt(),
                messages.stream().map(ConversationMessageResponse::from).toList()
        );
    }

    private static String extractInitials(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "SV";
        }

        return java.util.Arrays.stream(fullName.trim().split("\\s+"))
                .filter(part -> !part.isBlank())
                .limit(2)
                .map(part -> part.substring(0, 1).toUpperCase())
                .reduce("", String::concat);
    }
}
