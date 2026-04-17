package com.signalvelocity.smsplatform.contacts.interfaces.rest.dto;

public record ImportContactsResponse(
        int importedCount,
        int failedCount,
        int totalRequested
) {
}
