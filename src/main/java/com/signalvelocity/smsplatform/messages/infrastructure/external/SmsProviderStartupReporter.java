package com.signalvelocity.smsplatform.messages.infrastructure.external;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class SmsProviderStartupReporter {

    private final SmsIntegrationProperties properties;

    @Bean
    ApplicationRunner smsProviderReporterRunner() {
        return args -> {
            log.info("SMS providers startup summary: defaultProvider={}, fallbackProvider={}",
                    properties.getDefaultProvider(),
                    properties.getFallbackProvider());

            properties.getProviders().forEach((providerId, provider) -> log.info(
                    "SMS provider [{}] enabled={}, mode={}, senderAddressConfigured={}, sendUrlConfigured={}, credentialsConfigured={}, authorizationHeaderConfigured={}",
                    providerId,
                    provider.isEnabled(),
                    provider.getMode(),
                    hasValue(provider.getSenderAddress()),
                    hasValue(provider.getSendUrl()),
                    hasValue(provider.getClientId()) && hasValue(provider.getClientSecret()),
                    hasValue(provider.getAuthorizationHeader())
            ));
        };
    }

    private boolean hasValue(String value) {
        return value != null && !value.isBlank();
    }
}
