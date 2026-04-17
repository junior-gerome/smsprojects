package com.signalvelocity.smsplatform.users.infrastructure.persistence;

import com.signalvelocity.smsplatform.users.domain.model.User;
import com.signalvelocity.smsplatform.users.domain.repository.UserRepository;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataUserRepository extends JpaRepository<User, UUID>, UserRepository {
}
