package com.signalvelocity.smsplatform.messages.infrastructure.persistence;

import com.signalvelocity.smsplatform.messages.domain.model.Conversation;
import com.signalvelocity.smsplatform.messages.domain.repository.ConversationRepository;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SpringDataConversationRepository extends JpaRepository<Conversation, UUID>, ConversationRepository {
    @Override
    @EntityGraph(attributePaths = {"contact"})
    java.util.List<Conversation> findAllByOwner_IdOrderByLastMessageAtDesc(UUID ownerId);

    @Override
    @EntityGraph(attributePaths = {"contact"})
    @Query("""
            select conversation from Conversation conversation
            join conversation.contact contact
            where conversation.owner.id = :ownerId
              and (
                lower(contact.firstName) like lower(concat('%', :query, '%'))
                or lower(contact.lastName) like lower(concat('%', :query, '%'))
                or lower(coalesce(contact.email, '')) like lower(concat('%', :query, '%'))
                or lower(contact.phoneNumber) like lower(concat('%', :query, '%'))
                or lower(coalesce(conversation.lastMessagePreview, '')) like lower(concat('%', :query, '%'))
              )
            order by
              case when conversation.lastMessageAt is null then 1 else 0 end,
              conversation.lastMessageAt desc
            """)
    java.util.List<Conversation> searchByOwner_Id(@Param("ownerId") UUID ownerId, @Param("query") String query, Pageable pageable);
}
