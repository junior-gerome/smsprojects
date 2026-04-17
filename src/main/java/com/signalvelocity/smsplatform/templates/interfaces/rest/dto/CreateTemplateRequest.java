package com.signalvelocity.smsplatform.templates.interfaces.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTemplateRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 300) String description,
        @NotBlank @Size(max = 1000) String content
) {
}
