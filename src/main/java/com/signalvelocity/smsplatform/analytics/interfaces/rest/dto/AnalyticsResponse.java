package com.signalvelocity.smsplatform.analytics.interfaces.rest.dto;

import com.signalvelocity.smsplatform.analytics.domain.model.AnalyticsSnapshot;

public record AnalyticsResponse(
        long totalUsers,
        long totalContacts,
        long totalGroups,
        long totalCampaigns,
        long scheduledCampaigns,
        long totalMessages,
        long deliveredMessages,
        long failedMessages,
        long activeAutomations,
        double deliveryRate
) {

    public static AnalyticsResponse from(AnalyticsSnapshot snapshot) {
        return new AnalyticsResponse(
                snapshot.totalUsers(),
                snapshot.totalContacts(),
                snapshot.totalGroups(),
                snapshot.totalCampaigns(),
                snapshot.scheduledCampaigns(),
                snapshot.totalMessages(),
                snapshot.deliveredMessages(),
                snapshot.failedMessages(),
                snapshot.activeAutomations(),
                snapshot.deliveryRate()
        );
    }
}
