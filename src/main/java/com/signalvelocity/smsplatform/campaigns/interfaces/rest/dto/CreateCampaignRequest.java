package com.signalvelocity.smsplatform.campaigns.interfaces.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

public record CreateCampaignRequest(
        @NotBlank @Size(max = 140) String name,
        @Size(max = 1000) String content,
        UUID templateId,
        LocalDateTime scheduleAt,
        Set<UUID> targetContactIds,
        Set<UUID> targetGroupIds,
        boolean sendNow
) {
    public CreateCampaignRequest {
        targetContactIds = targetContactIds == null ? Set.of() : targetContactIds;
        targetGroupIds = targetGroupIds == null ? Set.of() : targetGroupIds;
    }
}
