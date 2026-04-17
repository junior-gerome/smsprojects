package com.signalvelocity.smsplatform.automation.application;

import com.signalvelocity.smsplatform.automation.domain.model.AutomationStatus;
import com.signalvelocity.smsplatform.automation.domain.model.AutomationWorkflow;
import com.signalvelocity.smsplatform.automation.domain.repository.AutomationWorkflowRepository;
import com.signalvelocity.smsplatform.automation.interfaces.rest.dto.AutomationWorkflowResponse;
import com.signalvelocity.smsplatform.automation.interfaces.rest.dto.CreateAutomationWorkflowRequest;
import com.signalvelocity.smsplatform.shared.application.CurrentUserProvider;
import com.signalvelocity.smsplatform.shared.application.exception.ResourceNotFoundException;
import com.signalvelocity.smsplatform.templates.domain.model.SmsTemplate;
import com.signalvelocity.smsplatform.templates.domain.repository.SmsTemplateRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AutomationApplicationService {

    private final AutomationWorkflowRepository automationWorkflowRepository;
    private final SmsTemplateRepository smsTemplateRepository;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    public AutomationWorkflowResponse create(CreateAutomationWorkflowRequest request) {
        var currentUser = currentUserProvider.getCurrentUser();
        SmsTemplate template = request.templateId() == null
                ? null
                : smsTemplateRepository.findById(request.templateId())
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        if (template != null && !template.getOwner().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Template not found");
        }

        AutomationWorkflow workflow = automationWorkflowRepository.save(AutomationWorkflow.builder()
                .name(request.name())
                .triggerType(request.triggerType())
                .actionType(request.actionType())
                .scheduleExpression(request.scheduleExpression())
                .status(request.active() ? AutomationStatus.ACTIVE : AutomationStatus.PAUSED)
                .template(template)
                .owner(currentUser)
                .build());

        return AutomationWorkflowResponse.from(workflow);
    }

    @Transactional(readOnly = true)
    public List<AutomationWorkflowResponse> findAll() {
        return automationWorkflowRepository.findAllByOwner_Id(currentUserProvider.getCurrentUser().getId()).stream()
                .map(AutomationWorkflowResponse::from)
                .toList();
    }
}
