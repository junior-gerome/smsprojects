package com.signalvelocity.smsplatform.campaigns.interfaces.rest.dto;

import com.signalvelocity.smsplatform.campaigns.domain.model.Campaign;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

public record CampaignResponse(
        UUID id,
        String name,
        String status,
        LocalDateTime scheduleAt,
        int totalRecipients,
        int deliveredCount,
        int failedCount,
        LocalDateTime createdAt,
        Set<UUID> targetContactIds,
        Set<UUID> targetGroupIds
) {

    public static CampaignResponse from(Campaign campaign) {
        return new CampaignResponse(
                campaign.getId(),
                campaign.getName(),
                campaign.getStatus().name(),
                campaign.getScheduleAt(),
                campaign.getTotalRecipients(),
                campaign.getDeliveredCount(),
                campaign.getFailedCount(),
                campaign.getCreatedAt(),
                Set.copyOf(campaign.getTargetContactIds()),
                Set.copyOf(campaign.getTargetGroupIds())
        );
    }
}
