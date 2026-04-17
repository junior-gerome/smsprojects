package com.signalvelocity.smsplatform.messages.interfaces.rest;

import com.signalvelocity.smsplatform.messages.application.ConversationApplicationService;
import com.signalvelocity.smsplatform.messages.interfaces.rest.dto.ConversationResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationApplicationService conversationApplicationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','ANALYST')")
    public List<ConversationResponse> findAll() {
        return conversationApplicationService.findAll();
    }
}
