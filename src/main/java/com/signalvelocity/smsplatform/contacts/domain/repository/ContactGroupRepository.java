package com.signalvelocity.smsplatform.contacts.domain.repository;

import com.signalvelocity.smsplatform.contacts.domain.model.ContactGroup;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

public interface ContactGroupRepository {

    ContactGroup save(ContactGroup group);

    Optional<ContactGroup> findById(UUID id);

    List<ContactGroup> findAllByOwner_Id(UUID ownerId);

    List<ContactGroup> findAllByIdIn(Collection<UUID> ids);

    List<ContactGroup> findAllByIdInAndOwner_Id(Collection<UUID> ids, UUID ownerId);

    List<ContactGroup> searchByOwner_Id(UUID ownerId, String query, Pageable pageable);

    long count();

    long countByOwner_Id(UUID ownerId);
}
