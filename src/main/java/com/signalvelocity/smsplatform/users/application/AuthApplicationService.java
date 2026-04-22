package com.signalvelocity.smsplatform.users.application;

import com.signalvelocity.smsplatform.security.JwtTokenProvider;
import com.signalvelocity.smsplatform.security.AuthenticatedUser;
import com.signalvelocity.smsplatform.shared.application.CurrentUserProvider;
import com.signalvelocity.smsplatform.shared.application.exception.BusinessException;
import com.signalvelocity.smsplatform.users.domain.model.Role;
import com.signalvelocity.smsplatform.users.domain.model.RoleName;
import com.signalvelocity.smsplatform.users.domain.model.User;
import com.signalvelocity.smsplatform.users.domain.model.UserEmailNormalizer;
import com.signalvelocity.smsplatform.users.domain.repository.RoleRepository;
import com.signalvelocity.smsplatform.users.domain.repository.UserRepository;
import com.signalvelocity.smsplatform.users.interfaces.rest.dto.LoginRequest;
import com.signalvelocity.smsplatform.users.interfaces.rest.dto.LoginResponse;
import com.signalvelocity.smsplatform.users.interfaces.rest.dto.PublicRegisterUserRequest;
import com.signalvelocity.smsplatform.users.interfaces.rest.dto.RegisterUserRequest;
import com.signalvelocity.smsplatform.users.interfaces.rest.dto.UserResponse;
import java.time.Instant;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthApplicationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    public UserResponse registerPublic(PublicRegisterUserRequest request) {
        return createUser(request.fullName(), request.email(), request.password(), Set.of(RoleName.ROLE_OPERATOR));
    }

    @Transactional
    public UserResponse createUser(RegisterUserRequest request) {
        Set<RoleName> requestedRoles = request.roles() == null || request.roles().isEmpty()
                ? Set.of(RoleName.ROLE_OPERATOR)
                : request.roles();

        return createUser(request.fullName(), request.email(), request.password(), requestedRoles);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        return UserResponse.from(currentUserProvider.getCurrentUser());
    }

    private UserResponse createUser(String fullName, String email, String password, Set<RoleName> requestedRoles) {
        String normalizedEmail = UserEmailNormalizer.normalize(email);

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BusinessException("A user with this email already exists");
        }

        Set<Role> roles = requestedRoles.stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new BusinessException("Role not found: " + roleName)))
                .collect(java.util.stream.Collectors.toSet());

        User user = userRepository.save(User.builder()
                .fullName(fullName)
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(password))
                .enabled(true)
                .roles(roles)
                .build());

        return UserResponse.from(user);
    }

    public LoginResponse login(LoginRequest request) {
        String normalizedEmail = UserEmailNormalizer.normalize(request.email());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
        );

        AuthenticatedUser authenticatedUser = (AuthenticatedUser) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(authenticatedUser.getUsername(), authenticatedUser.getAuthorities());
        User user = userRepository.findByEmailIgnoreCase(authenticatedUser.getUsername())
                .orElseThrow(() -> new BusinessException("Authenticated user not found"));

        return new LoginResponse(
                token,
                "Bearer",
                Instant.now().plusMillis(jwtTokenProvider.getExpirationMillis()),
                UserResponse.from(user)
        );
    }
}
