package com.signalvelocity.smsplatform.messages.interfaces.rest;

import com.signalvelocity.smsplatform.messages.application.SmsProviderAdministrationService;
import com.signalvelocity.smsplatform.messages.interfaces.rest.dto.SmsProviderStatusResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/sms/providers")
@RequiredArgsConstructor
public class SmsProviderAdminController {

    private final SmsProviderAdministrationService smsProviderAdministrationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<SmsProviderStatusResponse> findAll() {
        return smsProviderAdministrationService.getProviderStatuses();
    }
}
