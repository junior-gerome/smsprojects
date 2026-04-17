package com.signalvelocity.smsplatform.automation.interfaces.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record CreateAutomationWorkflowRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 80) String triggerType,
        @NotBlank @Size(max = 80) String actionType,
        @Size(max = 120) String scheduleExpression,
        UUID templateId,
        boolean active
) {
}
