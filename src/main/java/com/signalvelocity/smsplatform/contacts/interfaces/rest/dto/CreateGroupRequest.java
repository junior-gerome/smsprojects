package com.signalvelocity.smsplatform.contacts.interfaces.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateGroupRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 300) String description
) {
}
