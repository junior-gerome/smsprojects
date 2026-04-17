package com.signalvelocity.smsplatform.messages.interfaces.rest;

import com.signalvelocity.smsplatform.messages.application.MessageApplicationService;
import com.signalvelocity.smsplatform.messages.interfaces.rest.dto.DeliveryWebhookRequest;
import com.signalvelocity.smsplatform.messages.interfaces.rest.dto.MessageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final MessageApplicationService messageApplicationService;

    @Value("${app.webhooks.delivery-secret}")
    private String expectedSecret;

    @PostMapping("/delivery")
    public MessageResponse deliveryUpdate(
            @RequestHeader("X-Webhook-Key") String webhookSecret,
            @Valid @RequestBody DeliveryWebhookRequest request
    ) {
        return messageApplicationService.handleDeliveryWebhook(webhookSecret, expectedSecret, request);
    }
}
