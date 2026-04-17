package com.signalvelocity.smsplatform.campaigns.interfaces.rest;

import com.signalvelocity.smsplatform.campaigns.application.CampaignApplicationService;
import com.signalvelocity.smsplatform.campaigns.interfaces.rest.dto.CampaignResponse;
import com.signalvelocity.smsplatform.campaigns.interfaces.rest.dto.CreateCampaignRequest;
import com.signalvelocity.smsplatform.shared.interfaces.rest.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignApplicationService campaignApplicationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
    public CampaignResponse create(@Valid @RequestBody CreateCampaignRequest request) {
        return campaignApplicationService.create(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','ANALYST')")
    public PageResponse<CampaignResponse> findAll(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return campaignApplicationService.findAll(pageable);
    }
}
