package com.signalvelocity.smsplatform.users.interfaces.rest;

import com.signalvelocity.smsplatform.users.application.AuthApplicationService;
import com.signalvelocity.smsplatform.users.application.UserApplicationService;
import com.signalvelocity.smsplatform.users.interfaces.rest.dto.RegisterUserRequest;
import com.signalvelocity.smsplatform.users.interfaces.rest.dto.UserResponse;
import jakarta.validation.Valid;
import java.util.List;
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
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserApplicationService userApplicationService;
    private final AuthApplicationService authApplicationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse create(@Valid @RequestBody RegisterUserRequest request) {
        return authApplicationService.createUser(request);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> findAll() {
        return userApplicationService.findAll();
    }
}
