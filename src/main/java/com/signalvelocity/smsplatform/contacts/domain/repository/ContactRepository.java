package com.signalvelocity.smsplatform.contacts.domain.repository;

import com.signalvelocity.smsplatform.contacts.domain.model.Contact;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ContactRepository {

    Contact save(Contact contact);

    List<Contact> findAllByCreatedBy_Id(UUID ownerId);

    Page<Contact> findPageByCreatedBy_Id(UUID ownerId, Pageable pageable);

    List<Contact> findAllByIdIn(Collection<UUID> ids);

    List<Contact> findAllByIdInAndCreatedBy_Id(Collection<UUID> ids, UUID ownerId);

    List<Contact> searchByCreatedBy_Id(UUID ownerId, String query, Pageable pageable);

    Optional<Contact> findById(UUID id);

    long count();

    long countByCreatedBy_Id(UUID ownerId);
}
