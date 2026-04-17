package com.signalvelocity.smsplatform.messages.infrastructure.external;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.signalvelocity.smsplatform.messages.domain.model.MessageStatus;
import com.signalvelocity.smsplatform.messages.domain.service.SmsGatewayResult;
import java.util.List;
import org.junit.jupiter.api.Test;

class RoutingSmsGatewayTest {

    @Test
    void shouldRouteOrangePrefixToOrangeProvider() {
        SmsIntegrationProperties properties = baseProperties();
        RoutingSmsGateway gateway = new RoutingSmsGateway(
                List.of(
                        new StubProviderClient("orange-cm", new SmsGatewayResult("orange-cm", "orange-1", MessageStatus.QUEUED, null)),
                        new StubProviderClient("demo", new SmsGatewayResult("demo", "demo-1", MessageStatus.QUEUED, null))
                ),
                properties,
                new PhoneNumberNormalizer(),
                new CameroonOperatorResolver(properties)
        );

        SmsGatewayResult result = gateway.send("699123456", "Hello");

        assertEquals("orange-cm", result.providerName());
        assertEquals("orange-1", result.providerMessageId());
    }

    @Test
    void shouldFallbackToDemoWhenPrimaryProviderFails() {
        SmsIntegrationProperties properties = baseProperties();
        RoutingSmsGateway gateway = new RoutingSmsGateway(
                List.of(
                        new StubProviderClient("orange-cm", new SmsGatewayResult("orange-cm", "orange-failed", MessageStatus.FAILED, "failure")),
                        new StubProviderClient("demo", new SmsGatewayResult("demo", "demo-ok", MessageStatus.QUEUED, null))
                ),
                properties,
                new PhoneNumberNormalizer(),
                new CameroonOperatorResolver(properties)
        );

        SmsGatewayResult result = gateway.send("699123456", "Hello");

        assertEquals("demo", result.providerName());
        assertEquals("demo-ok", result.providerMessageId());
        assertEquals(MessageStatus.QUEUED, result.initialStatus());
    }

    private SmsIntegrationProperties baseProperties() {
        SmsIntegrationProperties properties = new SmsIntegrationProperties();
        properties.setDefaultProvider("demo");
        properties.setFallbackProvider("demo");
        properties.setDefaultSenderId("SIGNALV");
        properties.getRouting().getOperatorProviders().put("orange-cm", "orange-cm");
        properties.getRouting().getOperatorPrefixes().put("orange-cm", List.of("23769"));
        return properties;
    }

    private record StubProviderClient(String providerId, SmsGatewayResult result) implements SmsProviderClient {
        @Override
        public SmsGatewayResult send(RoutedSmsRequest request) {
            return result;
        }
    }
}
