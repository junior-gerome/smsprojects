package com.signalvelocity.smsplatform.messages.interfaces.rest.dto;

import jakarta.validation.constraints.Size;
import java.util.UUID;

public record SendSmsRequest(
        UUID contactId,
        @Size(max = 80) String firstName,
        @Size(max = 80) String lastName,
        @Size(max = 30) String phoneNumber,
        @Size(max = 1000) String content,
        UUID templateId
) {
}
