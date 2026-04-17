package com.signalvelocity.smsplatform.users.domain.repository;

import com.signalvelocity.smsplatform.users.domain.model.Role;
import com.signalvelocity.smsplatform.users.domain.model.RoleName;
import java.util.List;
import java.util.Optional;

public interface RoleRepository {

    Role save(Role role);

    Optional<Role> findByName(RoleName name);

    List<Role> findAll();
}
