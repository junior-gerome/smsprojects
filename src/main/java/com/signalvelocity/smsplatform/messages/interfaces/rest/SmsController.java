package com.signalvelocity.smsplatform.messages.interfaces.rest;

import com.signalvelocity.smsplatform.messages.application.MessageApplicationService;
import com.signalvelocity.smsplatform.messages.interfaces.rest.dto.MessageResponse;
import com.signalvelocity.smsplatform.messages.interfaces.rest.dto.SendSmsRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sms")
@RequiredArgsConstructor
public class SmsController {

    private final MessageApplicationService messageApplicationService;

    @PostMapping("/send")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
    public MessageResponse send(@Valid @RequestBody SendSmsRequest request) {
        return messageApplicationService.sendDirectMessage(request);
    }
}
