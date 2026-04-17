package com.signalvelocity.smsplatform.contacts.interfaces.rest.dto;

import com.signalvelocity.smsplatform.contacts.domain.model.Contact;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

public record ContactResponse(
        UUID id,
        String fullName,
        String email,
        String phoneNumber,
        String status,
        Set<String> tags,
        Set<String> groups,
        LocalDateTime createdAt
) {

    public static ContactResponse from(Contact contact) {
        return new ContactResponse(
                contact.getId(),
                contact.getFullName(),
                contact.getEmail(),
                contact.getPhoneNumber(),
                contact.getStatus().name(),
                contact.getTags(),
                contact.getGroups().stream().map(group -> group.getName()).collect(java.util.stream.Collectors.toSet()),
                contact.getCreatedAt()
        );
    }
}
