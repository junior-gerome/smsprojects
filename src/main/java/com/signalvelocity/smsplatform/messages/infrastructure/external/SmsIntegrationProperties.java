package com.signalvelocity.smsplatform.messages.infrastructure.external;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.sms")
public class SmsIntegrationProperties {

    private String defaultProvider = "demo";
    private String fallbackProvider = "demo";
    private String defaultSenderId = "SIGNALV";
    private RoutingProperties routing = new RoutingProperties();
    private Map<String, ProviderProperties> providers = new LinkedHashMap<>();

    @Getter
    @Setter
    public static class RoutingProperties {
        private String countryCode = "237";
        private Map<String, List<String>> operatorPrefixes = new LinkedHashMap<>();
        private Map<String, String> operatorProviders = new LinkedHashMap<>();
    }

    @Getter
    @Setter
    public static class ProviderProperties {
        private boolean enabled;
        private String mode = "demo";
        private String senderId;
        private String senderAddress;
        private String baseUrl;
        private String authUrl;
        private String sendUrl;
        private String authorizationHeader;
        private String clientId;
        private String clientSecret;
        private String apiKey;
        private String productKey;
        private Map<String, String> headers = new LinkedHashMap<>();
        private List<String> scopes = new ArrayList<>();
    }
}
