package com.signalvelocity.smsplatform.messages.infrastructure.external;

import com.signalvelocity.smsplatform.shared.application.exception.BusinessException;
import org.springframework.stereotype.Component;

@Component
public class PhoneNumberNormalizer {

    public String normalize(String rawPhoneNumber, String countryCode) {
        if (rawPhoneNumber == null || rawPhoneNumber.isBlank()) {
            throw new BusinessException("Phone number is required");
        }

        String digits = rawPhoneNumber.replaceAll("[^0-9+]", "");
        if (digits.startsWith("+")) {
            digits = digits.substring(1);
        }
        if (digits.startsWith("00")) {
            digits = digits.substring(2);
        }
        if (!digits.startsWith(countryCode) && digits.length() == 9) {
            digits = countryCode + digits;
        }

        if (!digits.matches("\\d{11,15}")) {
            throw new BusinessException("Phone number format is invalid for SMS delivery");
        }

        return digits;
    }
}
