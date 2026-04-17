package com.signalvelocity.smsplatform.users.infrastructure.persistence;

import com.signalvelocity.smsplatform.users.domain.model.Role;
import com.signalvelocity.smsplatform.users.domain.model.RoleName;
import com.signalvelocity.smsplatform.users.domain.model.User;
import com.signalvelocity.smsplatform.users.domain.repository.RoleRepository;
import com.signalvelocity.smsplatform.users.domain.repository.UserRepository;
import java.util.EnumSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class BootstrapDataInitializer {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin.enabled:false}")
    private boolean bootstrapAdminEnabled;

    @Value("${app.bootstrap.admin.email:}")
    private String bootstrapAdminEmail;

    @Value("${app.bootstrap.admin.password:}")
    private String bootstrapAdminPassword;

    @Bean
    ApplicationRunner bootstrapRunner() {
        return args -> {
            EnumSet.allOf(RoleName.class).forEach(roleName ->
                    roleRepository.findByName(roleName)
                            .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()))
            );

            if (!bootstrapAdminEnabled) {
                return;
            }

            if (bootstrapAdminEmail.isBlank() || bootstrapAdminPassword.isBlank()) {
                throw new IllegalStateException("Bootstrap admin is enabled but email/password are not configured");
            }

            if (!userRepository.existsByEmail(bootstrapAdminEmail)) {
                Set<Role> adminRoles = Set.of(
                        roleRepository.findByName(RoleName.ROLE_ADMIN).orElseThrow(),
                        roleRepository.findByName(RoleName.ROLE_MANAGER).orElseThrow()
                );

                userRepository.save(User.builder()
                        .fullName("Platform Admin")
                        .email(bootstrapAdminEmail)
                        .passwordHash(passwordEncoder.encode(bootstrapAdminPassword))
                        .enabled(true)
                        .roles(adminRoles)
                        .build());
            }
        };
    }
}
