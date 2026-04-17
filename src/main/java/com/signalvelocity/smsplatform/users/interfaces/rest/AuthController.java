package com.signalvelocity.smsplatform.users.interfaces.rest;

import com.signalvelocity.smsplatform.users.application.AuthApplicationService;
import com.signalvelocity.smsplatform.users.interfaces.rest.dto.LoginRequest;
import com.signalvelocity.smsplatform.users.interfaces.rest.dto.LoginResponse;
import com.signalvelocity.smsplatform.users.interfaces.rest.dto.PublicRegisterUserRequest;
import com.signalvelocity.smsplatform.users.interfaces.rest.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthApplicationService authApplicationService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody PublicRegisterUserRequest request) {
        return authApplicationService.registerPublic(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authApplicationService.login(request);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UserResponse me() {
        return authApplicationService.getCurrentUser();
    }
}
