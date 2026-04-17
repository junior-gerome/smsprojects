package com.signalvelocity.smsplatform.messages.infrastructure.external;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.signalvelocity.smsplatform.messages.domain.model.MessageStatus;
import com.signalvelocity.smsplatform.messages.domain.service.SmsGatewayResult;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class OrangeCameroonSmsProviderClientTest {

    private HttpServer httpServer;

    @BeforeEach
    void setUp() throws IOException {
        httpServer = HttpServer.create(new InetSocketAddress(0), 0);
    }

    @AfterEach
    void tearDown() {
        if (httpServer != null) {
            httpServer.stop(0);
        }
    }

    @Test
    void shouldSendSmsThroughOrangeAndReuseCachedToken() throws Exception {
        AtomicInteger tokenRequests = new AtomicInteger();
        AtomicInteger sendRequests = new AtomicInteger();

        httpServer.createContext("/oauth/token", exchange -> {
            tokenRequests.incrementAndGet();
            assertEquals("POST", exchange.getRequestMethod());
            writeJson(exchange, 200, "{\"access_token\":\"orange-token\",\"expires_in\":3600}");
        });

        httpServer.createContext("/sms", exchange -> {
            sendRequests.incrementAndGet();
            assertEquals("POST", exchange.getRequestMethod());
            String payload = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            assertTrue(payload.contains("tel:+237699123456"));
            assertTrue(payload.contains("tel:+2370000"));
            assertTrue(payload.contains("SIGNALV"));
            assertEquals("Bearer orange-token", exchange.getRequestHeaders().getFirst("Authorization"));
            writeJson(exchange, 200, "{\"outboundSMSMessageRequest\":{\"resourceURL\":\"orange-resource-001\"}}");
        });

        httpServer.start();

        SmsIntegrationProperties properties = new SmsIntegrationProperties();
        SmsIntegrationProperties.ProviderProperties orange = new SmsIntegrationProperties.ProviderProperties();
        orange.setEnabled(true);
        orange.setMode("live");
        orange.setAuthUrl("http://localhost:" + httpServer.getAddress().getPort() + "/oauth/token");
        orange.setSendUrl("http://localhost:" + httpServer.getAddress().getPort() + "/sms");
        orange.setClientId("orange-client");
        orange.setClientSecret("orange-secret");
        orange.setSenderId("SIGNALV");
        orange.setSenderAddress("tel:+2370000");
        orange.setScopes(List.of("sms"));
        properties.getProviders().put("orange-cm", orange);

        OrangeCameroonSmsProviderClient client = new OrangeCameroonSmsProviderClient(properties, new ObjectMapper());
        RoutedSmsRequest request = new RoutedSmsRequest(
                "orange-cm",
                "orange-cm",
                "699123456",
                "237699123456",
                "Hello Orange",
                "SIGNALV"
        );

        SmsGatewayResult firstResult = client.send(request);
        SmsGatewayResult secondResult = client.send(request);

        assertEquals("orange-cm", firstResult.providerName());
        assertEquals(MessageStatus.QUEUED, firstResult.initialStatus());
        assertEquals("orange-resource-001", firstResult.providerMessageId());
        assertEquals(1, tokenRequests.get());
        assertEquals(2, sendRequests.get());
        assertEquals("orange-resource-001", secondResult.providerMessageId());
    }

    private void writeJson(HttpExchange exchange, int status, String payload) throws IOException {
        byte[] responseBytes = payload.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, responseBytes.length);
        try (OutputStream outputStream = exchange.getResponseBody()) {
            outputStream.write(responseBytes);
        }
    }
}
