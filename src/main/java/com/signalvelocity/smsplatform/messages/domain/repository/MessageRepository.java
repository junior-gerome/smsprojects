package com.signalvelocity.smsplatform.messages.domain.repository;

import com.signalvelocity.smsplatform.messages.domain.model.Message;
import com.signalvelocity.smsplatform.messages.domain.model.MessageStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MessageRepository {

    Message save(Message message);

    Optional<Message> findByProviderMessageId(String providerMessageId);

    Optional<Message> findById(UUID id);

    List<Message> findAllByConversation_IdOrderByCreatedAtAsc(UUID conversationId);

    Optional<Message> findTopByProviderNameOrderByCreatedAtDesc(String providerName);

    long count();

    long countByStatus(MessageStatus status);

    long countByOwner_Id(UUID ownerId);

    long countByOwner_IdAndStatus(UUID ownerId, MessageStatus status);

    long countByCampaign_Id(UUID campaignId);

    long countByCampaign_IdAndStatus(UUID campaignId, MessageStatus status);
}
