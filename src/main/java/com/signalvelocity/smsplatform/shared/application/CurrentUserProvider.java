package com.signalvelocity.smsplatform.shared.application;

import com.signalvelocity.smsplatform.shared.application.exception.ResourceNotFoundException;
import com.signalvelocity.smsplatform.users.domain.model.User;
import com.signalvelocity.smsplatform.users.domain.model.UserEmailNormalizer;
import com.signalvelocity.smsplatform.users.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUserProvider {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new ResourceNotFoundException("Authenticated user not found");
        }

        return userRepository.findByEmailIgnoreCase(UserEmailNormalizer.normalize(authentication.getName()))
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
