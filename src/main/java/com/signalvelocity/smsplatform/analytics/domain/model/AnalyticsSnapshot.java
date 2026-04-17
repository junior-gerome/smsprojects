package com.signalvelocity.smsplatform.analytics.domain.model;

public record AnalyticsSnapshot(
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
}
