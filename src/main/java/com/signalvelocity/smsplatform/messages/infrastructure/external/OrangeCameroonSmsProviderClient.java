package com.signalvelocity.smsplatform.messages.infrastructure.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.signalvelocity.smsplatform.messages.domain.model.MessageStatus;
import com.signalvelocity.smsplatform.messages.domain.service.SmsGatewayResult;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class OrangeCameroonSmsProviderClient extends AbstractSmsProviderClient {

    public OrangeCameroonSmsProviderClient(SmsIntegrationProperties properties, ObjectMapper objectMapper) {
        super(properties, objectMapper);
    }

    @Override
    public String providerId() {
        return "orange-cm";
    }

    @Override
    protected SmsGatewayResult sendLive(RoutedSmsRequest request, SmsIntegrationProperties.ProviderProperties provider) {
        try {
            if (provider.getSendUrl() == null || provider.getSendUrl().isBlank()) {
                return failed("Orange send URL is missing.");
            }
            if (provider.getSenderAddress() == null || provider.getSenderAddress().isBlank()) {
                return failed("Orange senderAddress is missing. Expected a value like tel:+2370000.");
            }

            String accessToken = requestClientCredentialsToken(provider);
            Map<String, String> headers = new LinkedHashMap<>();
            headers.put("Authorization", "Bearer " + accessToken);
            provider.getHeaders().forEach(headers::put);

            Map<String, Object> outboundRequest = new HashMap<>();
            outboundRequest.put("address", "tel:+" + request.normalizedPhoneNumber());
            outboundRequest.put("senderAddress", provider.getSenderAddress());
            if (provider.getSenderId() != null
                    && !provider.getSenderId().isBlank()
                    && !provider.getSenderId().equalsIgnoreCase(provider.getSenderAddress())) {
                outboundRequest.put("senderName", provider.getSenderId());
            }
            outboundRequest.put("outboundSMSTextMessage", Map.of("message", request.content()));

            String requestBody = objectMapper().writeValueAsString(Map.of(
                    "outboundSMSMessageRequest", outboundRequest
            ));

            JsonNode response = postJson(provider.getSendUrl(), requestBody, headers);
            String providerMessageId = extractOrangeMessageId(response);

            log.info("Orange Cameroon SMS dispatched to {}", request.normalizedPhoneNumber());
            return new SmsGatewayResult(providerId(), providerMessageId, MessageStatus.QUEUED, null);
        } catch (Exception exception) {
            log.error("Orange Cameroon SMS dispatch failed", exception);
            return failed("Orange Cameroon dispatch failed: " + exception.getMessage());
        }
    }

    private String extractOrangeMessageId(JsonNode response) {
        JsonNode resourceUrl = response.path("outboundSMSMessageRequest").path("resourceURL");
        if (!resourceUrl.isMissingNode() && !resourceUrl.asText().isBlank()) {
            return resourceUrl.asText();
        }

        JsonNode requestError = response.path("requestError");
        if (!requestError.isMissingNode() && requestError.has("messageId")) {
            return requestError.path("messageId").asText();
        }

        return providerId() + "-" + UUID.randomUUID();
    }
}
