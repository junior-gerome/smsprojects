package com.signalvelocity.smsplatform.messages.infrastructure.external;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.signalvelocity.smsplatform.messages.domain.service.SmsGatewayResult;
import org.springframework.stereotype.Component;

@Component
public class CamtelSmsProviderClient extends AbstractSmsProviderClient {

    public CamtelSmsProviderClient(SmsIntegrationProperties properties, ObjectMapper objectMapper) {
        super(properties, objectMapper);
    }

    @Override
    public String providerId() {
        return "camtel";
    }

    @Override
    protected SmsGatewayResult sendLive(RoutedSmsRequest request, SmsIntegrationProperties.ProviderProperties provider) {
        return failed("CAMTEL live adapter requires a confirmed enterprise API contract before activation.");
    }
}
