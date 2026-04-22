package com.signalvelocity.smsplatform.users.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.signalvelocity.smsplatform.security.AuthenticatedUser;
import com.signalvelocity.smsplatform.security.JwtTokenProvider;
import com.signalvelocity.smsplatform.shared.application.CurrentUserProvider;
import com.signalvelocity.smsplatform.users.domain.model.Role;
import com.signalvelocity.smsplatform.users.domain.model.RoleName;
import com.signalvelocity.smsplatform.users.domain.model.User;
import com.signalvelocity.smsplatform.users.domain.repository.RoleRepository;
import com.signalvelocity.smsplatform.users.domain.repository.UserRepository;
import com.signalvelocity.smsplatform.users.interfaces.rest.dto.LoginRequest;
import com.signalvelocity.smsplatform.users.interfaces.rest.dto.LoginResponse;
import com.signalvelocity.smsplatform.users.interfaces.rest.dto.RegisterUserRequest;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthApplicationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    @Captor
    private ArgumentCaptor<Authentication> authenticationCaptor;

    @InjectMocks
    private AuthApplicationService authApplicationService;

    @Test
    void createUserShouldNormalizeEmailBeforeCheckingAndSaving() {
        Role operatorRole = Role.builder().name(RoleName.ROLE_OPERATOR).build();

        when(userRepository.existsByEmailIgnoreCase("user@example.com")).thenReturn(false);
        when(roleRepository.findByName(RoleName.ROLE_OPERATOR)).thenReturn(java.util.Optional.of(operatorRole));
        when(passwordEncoder.encode("Password123!")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            savedUser.setId(UUID.randomUUID());
            return savedUser;
        });

        authApplicationService.createUser(new RegisterUserRequest(
                "Lead Review",
                "  User@Example.COM ",
                "Password123!",
                Set.of(RoleName.ROLE_OPERATOR)
        ));

        verify(userRepository).existsByEmailIgnoreCase("user@example.com");
        verify(userRepository).save(userCaptor.capture());
        assertEquals("user@example.com", userCaptor.getValue().getEmail());
        assertEquals("encoded-password", userCaptor.getValue().getPasswordHash());
    }

    @Test
    void loginShouldAuthenticateAndLoadUsingNormalizedEmail() {
        AuthenticatedUser principal = new AuthenticatedUser(
                UUID.randomUUID(),
                "user@example.com",
                "encoded-password",
                true,
                java.util.List.of(new SimpleGrantedAuthority(RoleName.ROLE_OPERATOR.name()))
        );
        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                principal,
                null,
                principal.getAuthorities()
        );
        User user = User.builder()
                .fullName("Lead Review")
                .email("user@example.com")
                .passwordHash("encoded-password")
                .enabled(true)
                .roles(Set.of(Role.builder().name(RoleName.ROLE_OPERATOR).build()))
                .build();

        when(authenticationManager.authenticate(any(Authentication.class))).thenReturn(authentication);
        when(jwtTokenProvider.generateToken(eq("user@example.com"), any())).thenReturn("jwt-token");
        when(jwtTokenProvider.getExpirationMillis()).thenReturn(60000L);
        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(java.util.Optional.of(user));

        LoginResponse response = authApplicationService.login(new LoginRequest(" User@Example.COM ", "Password123!"));

        verify(authenticationManager).authenticate(authenticationCaptor.capture());
        assertNotNull(response);
        assertEquals("jwt-token", response.accessToken());
        assertEquals("user@example.com", authenticationCaptor.getValue().getPrincipal());
        assertEquals("user@example.com", response.user().email());
    }
}
