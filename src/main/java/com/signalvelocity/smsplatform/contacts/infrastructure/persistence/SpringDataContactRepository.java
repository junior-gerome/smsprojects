package com.signalvelocity.smsplatform.contacts.infrastructure.persistence;

import com.signalvelocity.smsplatform.contacts.domain.model.Contact;
import com.signalvelocity.smsplatform.contacts.domain.repository.ContactRepository;
import java.util.Collection;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SpringDataContactRepository extends JpaRepository<Contact, UUID>, ContactRepository {
    @Override
    Page<Contact> findPageByCreatedBy_Id(UUID ownerId, Pageable pageable);

    @Override
    java.util.List<Contact> findAllByCreatedBy_Id(UUID ownerId);

    @Override
    java.util.List<Contact> findAllByIdInAndCreatedBy_Id(Collection<UUID> ids, UUID ownerId);

    @Override
    @Query("""
            select contact from Contact contact
            where contact.createdBy.id = :ownerId
              and (
                lower(contact.firstName) like lower(concat('%', :query, '%'))
                or lower(contact.lastName) like lower(concat('%', :query, '%'))
                or lower(coalesce(contact.email, '')) like lower(concat('%', :query, '%'))
                or lower(contact.phoneNumber) like lower(concat('%', :query, '%'))
              )
            order by contact.createdAt desc
            """)
    java.util.List<Contact> searchByCreatedBy_Id(@Param("ownerId") UUID ownerId, @Param("query") String query, Pageable pageable);

    @Override
    long countByCreatedBy_Id(UUID ownerId);
}
