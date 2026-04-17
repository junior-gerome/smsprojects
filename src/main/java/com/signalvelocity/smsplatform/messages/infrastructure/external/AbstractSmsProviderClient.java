package com.signalvelocity.smsplatform.messages.infrastructure.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.signalvelocity.smsplatform.messages.domain.model.MessageStatus;
import com.signalvelocity.smsplatform.messages.domain.service.SmsGatewayResult;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
public abstract class AbstractSmsProviderClient implements SmsProviderClient {

    private final SmsIntegrationProperties properties;
    private final ObjectMapper objectMapper;
    private final Map<String, CachedAccessToken> tokenCache = new ConcurrentHashMap<>();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Override
    public SmsGatewayResult send(RoutedSmsRequest request) {
        SmsIntegrationProperties.ProviderProperties provider = providerProperties();
        if (provider == null) {
            return failed("Provider configuration is missing.");
        }

        if (!provider.isEnabled()) {
            return failed("Provider " + providerId() + " is disabled.");
        }

        if (isLiveMode(provider)) {
            return sendLive(request, provider);
        }

        return sendDemo(request);
    }

    protected SmsIntegrationProperties.ProviderProperties providerProperties() {
        return properties.getProviders().get(providerId());
    }

    protected SmsIntegrationProperties properties() {
        return properties;
    }

    protected ObjectMapper objectMapper() {
        return objectMapper;
    }

    protected SmsGatewayResult sendDemo(RoutedSmsRequest request) {
        String providerMessageId = providerId() + "-" + UUID.randomUUID();
        log.info("Demo SMS dispatch via provider={} operator={} to={}", providerId(), request.operatorKey(), request.normalizedPhoneNumber());
        return new SmsGatewayResult(providerId(), providerMessageId, MessageStatus.QUEUED, null);
    }

    protected abstract SmsGatewayResult sendLive(
            RoutedSmsRequest request,
            SmsIntegrationProperties.ProviderProperties provider
    );

    protected boolean isLiveMode(SmsIntegrationProperties.ProviderProperties provider) {
        return provider != null && "live".equalsIgnoreCase(provider.getMode());
    }

    protected SmsGatewayResult failed(String errorMessage) {
        return new SmsGatewayResult(providerId(), providerId() + "-failed-" + UUID.randomUUID(), MessageStatus.FAILED, errorMessage);
    }

    protected JsonNode postJson(
            String url,
            String body,
            Map<String, String> headers
    ) throws IOException, InterruptedException {
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(20))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8));

        headers.forEach(requestBuilder::header);
        HttpResponse<String> response = httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("SMS provider returned status " + response.statusCode() + " with body: " + response.body());
        }

        if (response.body() == null || response.body().isBlank()) {
            return objectMapper.createObjectNode();
        }
        return objectMapper.readTree(response.body());
    }

    protected String requestClientCredentialsToken(SmsIntegrationProperties.ProviderProperties provider)
            throws IOException, InterruptedException {
        CachedAccessToken cachedAccessToken = tokenCache.get(providerId());
        if (cachedAccessToken != null && cachedAccessToken.isStillValid()) {
            return cachedAccessToken.token();
        }

        if (provider.getAuthUrl() == null || provider.getAuthUrl().isBlank()) {
            throw new IOException("Auth URL is missing");
        }
        String authorizationHeader = provider.getAuthorizationHeader();
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            if (provider.getClientId() == null || provider.getClientId().isBlank()
                    || provider.getClientSecret() == null || provider.getClientSecret().isBlank()) {
                throw new IOException("Client credentials are missing");
            }

            String credentials = provider.getClientId() + ":" + provider.getClientSecret();
            authorizationHeader = "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
        }

        String body = "grant_type=client_credentials";
        if (!provider.getScopes().isEmpty()) {
            body = body + "&scope=" + String.join(" ", provider.getScopes());
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(provider.getAuthUrl()))
                .timeout(Duration.ofSeconds(20))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Accept", "application/json")
                .header("Authorization", authorizationHeader)
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("Token endpoint returned status " + response.statusCode() + " with body: " + response.body());
        }

        JsonNode payload = objectMapper.readTree(response.body());
        JsonNode tokenNode = payload.path("access_token");
        if (tokenNode.isMissingNode() || tokenNode.asText().isBlank()) {
            throw new IOException("Token endpoint did not return an access_token");
        }

        long expiresInSeconds = payload.path("expires_in").asLong(3300);
        CachedAccessToken newToken = new CachedAccessToken(
                tokenNode.asText(),
                Instant.now().plusSeconds(Math.max(expiresInSeconds - 60, 60))
        );
        tokenCache.put(providerId(), newToken);
        return newToken.token();
    }

    private record CachedAccessToken(String token, Instant expiresAt) {
        private boolean isStillValid() {
            return expiresAt != null && Instant.now().isBefore(expiresAt);
        }
    }
}
