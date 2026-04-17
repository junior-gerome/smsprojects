package com.signalvelocity.smsplatform.messages.infrastructure.external;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.signalvelocity.smsplatform.messages.domain.service.SmsGatewayResult;
import org.springframework.stereotype.Component;

@Component
public class DemoSmsProviderClient extends AbstractSmsProviderClient {

    public DemoSmsProviderClient(SmsIntegrationProperties properties, ObjectMapper objectMapper) {
        super(properties, objectMapper);
    }

    @Override
    public String providerId() {
        return "demo";
    }

    @Override
    protected SmsGatewayResult sendLive(RoutedSmsRequest request, SmsIntegrationProperties.ProviderProperties provider) {
        return sendDemo(request);
    }
}
