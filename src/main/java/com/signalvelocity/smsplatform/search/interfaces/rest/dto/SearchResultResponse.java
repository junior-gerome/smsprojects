package com.signalvelocity.smsplatform.search.interfaces.rest.dto;

public record SearchResultResponse(
        String id,
        String kind,
        String title,
        String subtitle,
        String route,
        String icon
) {
}
