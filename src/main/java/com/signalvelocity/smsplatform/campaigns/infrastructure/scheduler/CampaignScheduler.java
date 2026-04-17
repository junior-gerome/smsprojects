package com.signalvelocity.smsplatform.campaigns.infrastructure.scheduler;

import com.signalvelocity.smsplatform.campaigns.application.CampaignApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CampaignScheduler {

    private final CampaignApplicationService campaignApplicationService;

    @Scheduled(fixedDelayString = "${app.scheduler.campaign-dispatch-delay}")
    public void dispatchScheduledCampaigns() {
        log.debug("Running scheduled campaign dispatcher");
        campaignApplicationService.dispatchDueScheduledCampaigns();
    }
}
