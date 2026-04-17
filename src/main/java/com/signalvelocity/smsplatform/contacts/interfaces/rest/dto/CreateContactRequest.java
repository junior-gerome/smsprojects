package com.signalvelocity.smsplatform.contacts.interfaces.rest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public record CreateContactRequest(
        @NotBlank @Size(max = 80) String firstName,
        @NotBlank @Size(max = 80) String lastName,
        @Email @Size(max = 180) String email,
        @NotBlank @Size(max = 30) String phoneNumber,
        List<UUID> groupIds,
        Set<String> tags
) {
    public CreateContactRequest {
        groupIds = groupIds == null ? List.of() : groupIds;
        tags = tags == null ? Set.of() : tags;
    }
}
