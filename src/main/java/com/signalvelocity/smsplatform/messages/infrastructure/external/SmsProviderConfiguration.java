package com.signalvelocity.smsplatform.messages.infrastructure.external;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(SmsIntegrationProperties.class)
public class SmsProviderConfiguration {
}
