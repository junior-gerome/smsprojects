package com.signalvelocity.smsplatform.messages.infrastructure.external;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.signalvelocity.smsplatform.messages.domain.service.SmsGatewayResult;
import org.springframework.stereotype.Component;

@Component
public class MtnCameroonSmsProviderClient extends AbstractSmsProviderClient {

    public MtnCameroonSmsProviderClient(SmsIntegrationProperties properties, ObjectMapper objectMapper) {
        super(properties, objectMapper);
    }

    @Override
    public String providerId() {
        return "mtn-cm";
    }

    @Override
    protected SmsGatewayResult sendLive(RoutedSmsRequest request, SmsIntegrationProperties.ProviderProperties provider) {
        return failed("MTN Cameroon live adapter requires contracted payload and authentication mapping before activation.");
    }
}
