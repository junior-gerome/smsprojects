package com.signalvelocity.smsplatform.users.interfaces.rest.dto;

import com.signalvelocity.smsplatform.users.domain.model.RoleName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Set;

public record RegisterUserRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(min = 8, max = 120) String password,
        Set<RoleName> roles
) {
}
