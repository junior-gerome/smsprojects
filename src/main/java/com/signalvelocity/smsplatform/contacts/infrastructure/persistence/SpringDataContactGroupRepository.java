package com.signalvelocity.smsplatform.contacts.infrastructure.persistence;

import com.signalvelocity.smsplatform.contacts.domain.model.ContactGroup;
import com.signalvelocity.smsplatform.contacts.domain.repository.ContactGroupRepository;
import java.util.Collection;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SpringDataContactGroupRepository extends JpaRepository<ContactGroup, UUID>, ContactGroupRepository {
    @Override
    @EntityGraph(attributePaths = {"contacts"})
    java.util.List<ContactGroup> findAllByOwner_Id(UUID ownerId);

    @Override
    @EntityGraph(attributePaths = {"contacts"})
    java.util.List<ContactGroup> findAllByIdInAndOwner_Id(Collection<UUID> ids, UUID ownerId);

    @Override
    @Query("""
            select contactGroup from ContactGroup contactGroup
            where contactGroup.owner.id = :ownerId
              and (
                lower(contactGroup.name) like lower(concat('%', :query, '%'))
                or lower(coalesce(contactGroup.description, '')) like lower(concat('%', :query, '%'))
              )
            order by contactGroup.createdAt desc
            """)
    java.util.List<ContactGroup> searchByOwner_Id(@Param("ownerId") UUID ownerId, @Param("query") String query, Pageable pageable);

    @Override
    long countByOwner_Id(UUID ownerId);
}
