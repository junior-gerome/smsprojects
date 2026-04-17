package com.signalvelocity.smsplatform.contacts.interfaces.rest;

import com.signalvelocity.smsplatform.contacts.application.ContactGroupApplicationService;
import com.signalvelocity.smsplatform.contacts.interfaces.rest.dto.CreateGroupRequest;
import com.signalvelocity.smsplatform.contacts.interfaces.rest.dto.GroupResponse;
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
@RequestMapping("/groups")
@RequiredArgsConstructor
public class GroupController {

    private final ContactGroupApplicationService contactGroupApplicationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
    public GroupResponse create(@Valid @RequestBody CreateGroupRequest request) {
        return contactGroupApplicationService.createGroup(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','ANALYST')")
    public List<GroupResponse> findAll() {
        return contactGroupApplicationService.findAll();
    }
}
