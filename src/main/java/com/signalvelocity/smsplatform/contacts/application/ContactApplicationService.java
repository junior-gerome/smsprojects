package com.signalvelocity.smsplatform.contacts.application;

import com.signalvelocity.smsplatform.contacts.domain.model.Contact;
import com.signalvelocity.smsplatform.contacts.domain.model.ContactGroup;
import com.signalvelocity.smsplatform.contacts.domain.model.ContactStatus;
import com.signalvelocity.smsplatform.contacts.domain.repository.ContactGroupRepository;
import com.signalvelocity.smsplatform.contacts.domain.repository.ContactRepository;
import com.signalvelocity.smsplatform.contacts.interfaces.rest.dto.ContactResponse;
import com.signalvelocity.smsplatform.contacts.interfaces.rest.dto.CreateContactRequest;
import com.signalvelocity.smsplatform.contacts.interfaces.rest.dto.ImportContactsRequest;
import com.signalvelocity.smsplatform.contacts.interfaces.rest.dto.ImportContactsResponse;
import com.signalvelocity.smsplatform.shared.application.CurrentUserProvider;
import com.signalvelocity.smsplatform.shared.application.exception.BusinessException;
import com.signalvelocity.smsplatform.users.domain.model.User;
import com.signalvelocity.smsplatform.shared.interfaces.rest.PageResponse;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContactApplicationService {

    private final ContactRepository contactRepository;
    private final ContactGroupRepository contactGroupRepository;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    public ContactResponse createContact(CreateContactRequest request) {
        var currentUser = currentUserProvider.getCurrentUser();
        Set<ContactGroup> groups = resolveGroups(request.groupIds(), currentUser.getId());
        Contact contact = buildContact(request, currentUser, groups);

        Contact savedContact = contactRepository.save(contact);
        groups.forEach(contactGroupRepository::save);
        return ContactResponse.from(savedContact);
    }

    @Transactional
    public ImportContactsResponse importContacts(ImportContactsRequest request) {
        var currentUser = currentUserProvider.getCurrentUser();
        Set<UUID> requestedGroupIds = request.contacts().stream()
                .flatMap(contact -> contact.groupIds().stream())
                .collect(Collectors.toSet());

        Map<UUID, ContactGroup> groupIndex = requestedGroupIds.isEmpty()
                ? Map.of()
                : contactGroupRepository.findAllByIdInAndOwner_Id(requestedGroupIds, currentUser.getId()).stream()
                        .collect(Collectors.toMap(ContactGroup::getId, group -> group));

        if (groupIndex.size() != requestedGroupIds.size()) {
            throw new BusinessException("One or more imported groups were not found for the authenticated user");
        }

        Set<ContactGroup> touchedGroups = new HashSet<>();
        for (CreateContactRequest contactRequest : request.contacts()) {
            Set<ContactGroup> groups = contactRequest.groupIds().stream()
                    .map(groupId -> {
                        ContactGroup group = groupIndex.get(groupId);
                        if (group == null) {
                            throw new BusinessException("One or more imported groups were not found for the authenticated user");
                        }
                        return group;
                    })
                    .collect(Collectors.toCollection(HashSet::new));

            Contact contact = buildContact(contactRequest, currentUser, groups);
            contactRepository.save(contact);
            touchedGroups.addAll(groups);
        }

        touchedGroups.forEach(contactGroupRepository::save);
        return new ImportContactsResponse(request.contacts().size(), 0, request.contacts().size());
    }

    @Transactional(readOnly = true)
    public PageResponse<ContactResponse> findAll(Pageable pageable) {
        return PageResponse.from(
                contactRepository.findPageByCreatedBy_Id(currentUserProvider.getCurrentUser().getId(), pageable),
                ContactResponse::from
        );
    }

    private Set<ContactGroup> resolveGroups(java.util.List<UUID> groupIds, UUID ownerId) {
        Set<ContactGroup> groups = new HashSet<>(contactGroupRepository.findAllByIdInAndOwner_Id(groupIds, ownerId));

        if (groups.size() != groupIds.size()) {
            throw new BusinessException("One or more groups were not found for the authenticated user");
        }

        return groups;
    }

    private Contact buildContact(CreateContactRequest request, User currentUser, Set<ContactGroup> groups) {
        Contact contact = Contact.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .phoneNumber(request.phoneNumber())
                .status(ContactStatus.ACTIVE)
                .tags(new HashSet<>(request.tags()))
                .createdBy(currentUser)
                .build();

        groups.forEach(group -> {
            group.getContacts().add(contact);
            contact.getGroups().add(group);
        });

        return contact;
    }
}
