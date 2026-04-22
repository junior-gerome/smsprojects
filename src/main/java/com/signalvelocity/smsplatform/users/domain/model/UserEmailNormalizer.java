package com.signalvelocity.smsplatform.users.domain.model;

import java.util.Locale;

public final class UserEmailNormalizer {

    private UserEmailNormalizer() {
    }

    public static String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
