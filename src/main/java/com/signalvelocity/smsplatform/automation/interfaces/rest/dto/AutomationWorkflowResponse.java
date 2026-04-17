package com.signalvelocity.smsplatform.automation.interfaces.rest.dto;

import com.signalvelocity.smsplatform.automation.domain.model.AutomationWorkflow;
import java.time.LocalDateTime;
import java.util.UUID;

public record AutomationWorkflowResponse(
        UUID id,
        String name,
        String triggerType,
        String actionType,
        String scheduleExpression,
        String status,
        LocalDateTime createdAt
) {

    public static AutomationWorkflowResponse from(AutomationWorkflow workflow) {
        return new AutomationWorkflowResponse(
                workflow.getId(),
                workflow.getName(),
                workflow.getTriggerType(),
                workflow.getActionType(),
                workflow.getScheduleExpression(),
                workflow.getStatus().name(),
                workflow.getCreatedAt()
        );
    }
}
