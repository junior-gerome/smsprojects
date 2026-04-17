package com.signalvelocity.smsplatform.messages.infrastructure.external;

import com.signalvelocity.smsplatform.messages.domain.service.SmsGateway;
import com.signalvelocity.smsplatform.messages.domain.service.SmsGatewayResult;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RoutingSmsGateway implements SmsGateway {

    private final List<SmsProviderClient> providerClients;
    private final SmsIntegrationProperties properties;
    private final PhoneNumberNormalizer phoneNumberNormalizer;
    private final CameroonOperatorResolver operatorResolver;

    @Override
    public SmsGatewayResult send(String phoneNumber, String content) {
        String normalizedPhoneNumber = phoneNumberNormalizer.normalize(phoneNumber, properties.getRouting().getCountryCode());
        String operatorKey = operatorResolver.resolve(normalizedPhoneNumber).orElse("unknown");
        String primaryProviderId = properties.getRouting().getOperatorProviders().getOrDefault(operatorKey, properties.getDefaultProvider());
        RoutedSmsRequest request = new RoutedSmsRequest(
                primaryProviderId,
                operatorKey,
                phoneNumber,
                normalizedPhoneNumber,
                content,
                resolveSenderId(primaryProviderId)
        );

        SmsGatewayResult primaryResult = dispatch(request, primaryProviderId);
        if (primaryResult.initialStatus() != com.signalvelocity.smsplatform.messages.domain.model.MessageStatus.FAILED) {
            return primaryResult;
        }

        String fallbackProviderId = properties.getFallbackProvider();
        if (fallbackProviderId == null || fallbackProviderId.isBlank() || fallbackProviderId.equalsIgnoreCase(primaryProviderId)) {
            return primaryResult;
        }

        log.warn("Primary SMS provider {} failed for operator {}. Falling back to {}.", primaryProviderId, operatorKey, fallbackProviderId);
        return dispatch(
                new RoutedSmsRequest(
                        fallbackProviderId,
                        operatorKey,
                        phoneNumber,
                        normalizedPhoneNumber,
                        content,
                        resolveSenderId(fallbackProviderId)
                ),
                fallbackProviderId
        );
    }

    private SmsGatewayResult dispatch(RoutedSmsRequest request, String providerId) {
        return providerClients.stream()
                .filter(client -> client.providerId().equalsIgnoreCase(providerId))
                .findFirst()
                .map(client -> client.send(request))
                .orElseGet(() -> new SmsGatewayResult(
                        providerId,
                        providerId + "-missing-provider",
                        com.signalvelocity.smsplatform.messages.domain.model.MessageStatus.FAILED,
                        "No SMS provider bean is registered for " + providerId
                ));
    }

    private String resolveSenderId(String providerId) {
        SmsIntegrationProperties.ProviderProperties provider = properties.getProviders().get(providerId);
        if (provider != null && provider.getSenderId() != null && !provider.getSenderId().isBlank()) {
            return provider.getSenderId();
        }
        return properties.getDefaultSenderId();
    }
}
