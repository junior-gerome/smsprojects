package com.signalvelocity.smsplatform.templates.interfaces.rest.dto;

import com.signalvelocity.smsplatform.templates.domain.model.SmsTemplate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TemplateResponse(
        UUID id,
        String name,
        String description,
        String content,
        LocalDateTime createdAt
) {

    public static TemplateResponse from(SmsTemplate template) {
        return new TemplateResponse(
                template.getId(),
                template.getName(),
                template.getDescription(),
                template.getContent(),
                template.getCreatedAt()
        );
    }
}
