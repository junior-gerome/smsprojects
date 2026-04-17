package com.signalvelocity.smsplatform.users.application;

import com.signalvelocity.smsplatform.users.domain.repository.UserRepository;
import com.signalvelocity.smsplatform.users.interfaces.rest.dto.UserResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserApplicationService {

    private final UserRepository userRepository;

    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    public long count() {
        return userRepository.count();
    }
}
