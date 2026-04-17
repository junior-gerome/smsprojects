package com.signalvelocity.smsplatform.messages.domain.repository;

import com.signalvelocity.smsplatform.messages.domain.model.Conversation;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

public interface ConversationRepository {

    Conversation save(Conversation conversation);

    Optional<Conversation> findByOwner_IdAndContact_Id(UUID ownerId, UUID contactId);

    List<Conversation> findAllByOwner_IdOrderByLastMessageAtDesc(UUID ownerId);

    List<Conversation> searchByOwner_Id(UUID ownerId, String query, Pageable pageable);
}
