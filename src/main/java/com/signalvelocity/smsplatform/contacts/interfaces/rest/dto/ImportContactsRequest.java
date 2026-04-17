package com.signalvelocity.smsplatform.contacts.interfaces.rest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record ImportContactsRequest(
        @NotEmpty List<@Valid CreateContactRequest> contacts
) {
}
