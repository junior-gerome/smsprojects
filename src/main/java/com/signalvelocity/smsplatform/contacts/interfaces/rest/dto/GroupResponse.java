package com.signalvelocity.smsplatform.contacts.interfaces.rest.dto;

import com.signalvelocity.smsplatform.contacts.domain.model.ContactGroup;
import java.time.LocalDateTime;
import java.util.UUID;

public record GroupResponse(
        UUID id,
        String name,
        String description,
        int memberCount,
        LocalDateTime createdAt
) {

    public static GroupResponse from(ContactGroup group) {
        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getContacts().size(),
                group.getCreatedAt()
        );
    }
}
