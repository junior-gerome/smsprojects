package com.signalvelocity.smsplatform.messages.application;

import com.signalvelocity.smsplatform.messages.domain.model.Conversation;
import com.signalvelocity.smsplatform.messages.domain.model.Message;
import com.signalvelocity.smsplatform.messages.domain.repository.ConversationRepository;
import com.signalvelocity.smsplatform.messages.domain.repository.MessageRepository;
import com.signalvelocity.smsplatform.messages.interfaces.rest.dto.ConversationResponse;
import com.signalvelocity.smsplatform.shared.application.CurrentUserProvider;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConversationApplicationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final CurrentUserProvider currentUserProvider;

    @Transactional(readOnly = true)
    public List<ConversationResponse> findAll() {
        return conversationRepository.findAllByOwner_IdOrderByLastMessageAtDesc(
                        currentUserProvider.getCurrentUser().getId()
                ).stream()
                .map(this::toResponse)
                .toList();
    }

    private ConversationResponse toResponse(Conversation conversation) {
        List<Message> messages = messageRepository.findAllByConversation_IdOrderByCreatedAtAsc(conversation.getId());
        return ConversationResponse.from(conversation, messages, resolvePresenceStatus(conversation.getLastMessageAt()));
    }

    private String resolvePresenceStatus(LocalDateTime lastMessageAt) {
        if (lastMessageAt == null) {
            return "queued";
        }

        long minutesSinceLastMessage = Duration.between(lastMessageAt, LocalDateTime.now()).toMinutes();
        if (minutesSinceLastMessage <= 15) {
            return "online";
        }
        if (minutesSinceLastMessage <= 120) {
            return "away";
        }
        return "queued";
    }
}
