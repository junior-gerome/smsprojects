package com.signalvelocity.smsplatform.messages.infrastructure.external;

import com.signalvelocity.smsplatform.messages.domain.service.SmsGatewayResult;

public interface SmsProviderClient {

    String providerId();

    SmsGatewayResult send(RoutedSmsRequest request);
}
