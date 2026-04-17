package com.signalvelocity.smsplatform.automation.interfaces.rest;

import com.signalvelocity.smsplatform.automation.application.AutomationApplicationService;
import com.signalvelocity.smsplatform.automation.interfaces.rest.dto.AutomationWorkflowResponse;
import com.signalvelocity.smsplatform.automation.interfaces.rest.dto.CreateAutomationWorkflowRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/automation")
@RequiredArgsConstructor
public class AutomationController {

    private final AutomationApplicationService automationApplicationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public AutomationWorkflowResponse create(@Valid @RequestBody CreateAutomationWorkflowRequest request) {
        return automationApplicationService.create(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','ANALYST')")
    public List<AutomationWorkflowResponse> findAll() {
        return automationApplicationService.findAll();
    }
}
