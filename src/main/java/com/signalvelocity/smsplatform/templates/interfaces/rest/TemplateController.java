package com.signalvelocity.smsplatform.templates.interfaces.rest;

import com.signalvelocity.smsplatform.templates.application.TemplateApplicationService;
import com.signalvelocity.smsplatform.templates.interfaces.rest.dto.CreateTemplateRequest;
import com.signalvelocity.smsplatform.templates.interfaces.rest.dto.TemplateResponse;
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
@RequestMapping("/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateApplicationService templateApplicationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
    public TemplateResponse create(@Valid @RequestBody CreateTemplateRequest request) {
        return templateApplicationService.create(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','ANALYST')")
    public List<TemplateResponse> findAll() {
        return templateApplicationService.findAll();
    }
}
