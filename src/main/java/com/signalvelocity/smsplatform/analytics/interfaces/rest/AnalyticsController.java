package com.signalvelocity.smsplatform.analytics.interfaces.rest;

import com.signalvelocity.smsplatform.analytics.application.AnalyticsApplicationService;
import com.signalvelocity.smsplatform.analytics.interfaces.rest.dto.AnalyticsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsApplicationService analyticsApplicationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','ANALYST')")
    public AnalyticsResponse getOverview() {
        return analyticsApplicationService.getOverview();
    }
}
