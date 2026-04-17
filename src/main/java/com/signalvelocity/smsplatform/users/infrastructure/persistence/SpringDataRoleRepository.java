package com.signalvelocity.smsplatform.users.infrastructure.persistence;

import com.signalvelocity.smsplatform.users.domain.model.Role;
import com.signalvelocity.smsplatform.users.domain.repository.RoleRepository;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataRoleRepository extends JpaRepository<Role, UUID>, RoleRepository {
}
