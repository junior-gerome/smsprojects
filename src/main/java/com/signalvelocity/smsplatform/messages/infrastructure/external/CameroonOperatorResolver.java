package com.signalvelocity.smsplatform.messages.infrastructure.external;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CameroonOperatorResolver {

    private final SmsIntegrationProperties properties;

    public Optional<String> resolve(String normalizedPhoneNumber) {
        for (Map.Entry<String, List<String>> entry : properties.getRouting().getOperatorPrefixes().entrySet()) {
            boolean matches = entry.getValue().stream()
                    .filter(prefix -> prefix != null && !prefix.isBlank())
                    .map(prefix -> prefix.replaceAll("[^0-9]", ""))
                    .anyMatch(normalizedPhoneNumber::startsWith);
            if (matches) {
                return Optional.of(entry.getKey());
            }
        }
        return Optional.empty();
    }
}
