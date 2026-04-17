package com.signalvelocity.smsplatform.messages.infrastructure.persistence;

import com.signalvelocity.smsplatform.messages.domain.model.Message;
import com.signalvelocity.smsplatform.messages.domain.repository.MessageRepository;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataMessageRepository extends JpaRepository<Message, UUID>, MessageRepository {
    @Override
    long countByOwner_Id(UUID ownerId);

    @Override
    long countByOwner_IdAndStatus(UUID ownerId, com.signalvelocity.smsplatform.messages.domain.model.MessageStatus status);
}
