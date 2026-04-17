package com.signalvelocity.smsplatform.users.domain.repository;

import com.signalvelocity.smsplatform.users.domain.model.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository {

    User save(User user);

    Optional<User> findById(UUID id);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findAll();

    long count();
}
