package com.signalvelocity.smsplatform.messages.application;

import com.signalvelocity.smsplatform.messages.infrastructure.external.SmsIntegrationProperties;
import com.signalvelocity.smsplatform.messages.interfaces.rest.dto.ApiCredentialStatusResponse;
import com.signalvelocity.smsplatform.messages.interfaces.rest.dto.SmsProviderStatusResponse;
import com.signalvelocity.smsplatform.messages.domain.repository.MessageRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SmsProviderAdministrationService {

    private final SmsIntegrationProperties properties;
    private final MessageRepository messageRepository;

    @Transactional(readOnly = true)
    public List<SmsProviderStatusResponse> getProviderStatuses() {
        Map<String, String> operatorProviders = properties.getRouting().getOperatorProviders();

        return properties.getProviders().entrySet().stream()
                .map(entry -> {
                    String providerId = entry.getKey();
                    SmsIntegrationProperties.ProviderProperties provider = entry.getValue();
                    List<String> routedOperators = operatorProviders.entrySet().stream()
                            .filter(route -> providerId.equalsIgnoreCase(route.getValue()))
                            .map(Map.Entry::getKey)
                            .sorted()
                            .toList();

                    return new SmsProviderStatusResponse(
                            providerId,
                            provider.isEnabled(),
                            provider.getMode(),
                            providerId.equalsIgnoreCase(properties.getDefaultProvider()),
                            providerId.equalsIgnoreCase(properties.getFallbackProvider()),
                            provider.getSenderId(),
                            provider.getSenderAddress(),
                            hasValue(provider.getAuthUrl()),
                            hasValue(provider.getSendUrl()),
                            hasValue(provider.getClientId()) && hasValue(provider.getClientSecret()),
                            routedOperators
                    );
                })
                .sorted(java.util.Comparator.comparing(SmsProviderStatusResponse::providerId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ApiCredentialStatusResponse> getApiCredentialStatuses() {
        return properties.getProviders().entrySet().stream()
                .map(entry -> {
                    String providerId = entry.getKey();
                    SmsIntegrationProperties.ProviderProperties provider = entry.getValue();

                    return new ApiCredentialStatusResponse(
                            providerId,
                            providerId.toUpperCase(Locale.ROOT),
                            resolveScopes(provider),
                            messageRepository.findTopByProviderNameOrderByCreatedAtDesc(providerId)
                                    .map(message -> message.getCreatedAt())
                                    .orElse(null),
                            providerReady(provider) ? "ACTIVE" : "ROTATE"
                    );
                })
                .sorted(java.util.Comparator.comparing(ApiCredentialStatusResponse::id))
                .toList();
    }

    private boolean hasValue(String value) {
        return value != null && !value.isBlank();
    }

    private boolean providerReady(SmsIntegrationProperties.ProviderProperties provider) {
        return provider.isEnabled() && hasValue(provider.getSendUrl()) && hasAnyCredential(provider);
    }

    private boolean hasAnyCredential(SmsIntegrationProperties.ProviderProperties provider) {
        return hasValue(provider.getApiKey())
                || hasValue(provider.getProductKey())
                || (hasValue(provider.getClientId()) && hasValue(provider.getClientSecret()));
    }

    private List<String> resolveScopes(SmsIntegrationProperties.ProviderProperties provider) {
        if (!provider.getScopes().isEmpty()) {
            return provider.getScopes();
        }

        List<String> derivedScopes = new ArrayList<>();
        if (hasValue(provider.getAuthUrl())) {
            derivedScopes.add("oauth.token");
        }
        if (hasValue(provider.getSendUrl())) {
            derivedScopes.add("sms.send");
        }
        if (hasValue(provider.getApiKey())) {
            derivedScopes.add("provider.apikey");
        }
        if (hasValue(provider.getProductKey())) {
            derivedScopes.add("provider.product");
        }
        if (derivedScopes.isEmpty()) {
            derivedScopes.add("configuration.pending");
        }

        return derivedScopes;
    }
}
