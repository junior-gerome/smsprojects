package com.signalvelocity.smsplatform.contacts.interfaces.rest;

import com.signalvelocity.smsplatform.contacts.application.ContactApplicationService;
import com.signalvelocity.smsplatform.contacts.interfaces.rest.dto.ContactResponse;
import com.signalvelocity.smsplatform.contacts.interfaces.rest.dto.CreateContactRequest;
import com.signalvelocity.smsplatform.contacts.interfaces.rest.dto.ImportContactsRequest;
import com.signalvelocity.smsplatform.contacts.interfaces.rest.dto.ImportContactsResponse;
import com.signalvelocity.smsplatform.shared.interfaces.rest.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactApplicationService contactApplicationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
    public ContactResponse create(@Valid @RequestBody CreateContactRequest request) {
        return contactApplicationService.createContact(request);
    }

    @PostMapping("/import")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
    public ImportContactsResponse importContacts(@Valid @RequestBody ImportContactsRequest request) {
        return contactApplicationService.importContacts(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','ANALYST')")
    public PageResponse<ContactResponse> findAll(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return contactApplicationService.findAll(pageable);
    }
}
