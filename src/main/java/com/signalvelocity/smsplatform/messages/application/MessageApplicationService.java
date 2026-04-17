package com.signalvelocity.smsplatform.messages.application;

import com.signalvelocity.smsplatform.campaigns.domain.model.Campaign;
import com.signalvelocity.smsplatform.campaigns.domain.model.CampaignStatus;
import com.signalvelocity.smsplatform.campaigns.domain.repository.CampaignRepository;
import com.signalvelocity.smsplatform.contacts.domain.model.Contact;
import com.signalvelocity.smsplatform.contacts.domain.model.ContactStatus;
import com.signalvelocity.smsplatform.contacts.domain.repository.ContactRepository;
import com.signalvelocity.smsplatform.messages.domain.model.Conversation;
import com.signalvelocity.smsplatform.messages.domain.model.Message;
import com.signalvelocity.smsplatform.messages.domain.model.MessageDirection;
import com.signalvelocity.smsplatform.messages.domain.model.MessageStatus;
import com.signalvelocity.smsplatform.messages.domain.repository.ConversationRepository;
import com.signalvelocity.smsplatform.messages.domain.repository.MessageRepository;
import com.signalvelocity.smsplatform.messages.domain.service.SmsGateway;
import com.signalvelocity.smsplatform.messages.domain.service.SmsGatewayResult;
import com.signalvelocity.smsplatform.messages.interfaces.rest.dto.DeliveryWebhookRequest;
import com.signalvelocity.smsplatform.messages.interfaces.rest.dto.MessageResponse;
import com.signalvelocity.smsplatform.messages.interfaces.rest.dto.SendSmsRequest;
import com.signalvelocity.smsplatform.shared.application.CurrentUserProvider;
import com.signalvelocity.smsplatform.shared.application.exception.BusinessException;
import com.signalvelocity.smsplatform.shared.application.exception.ResourceNotFoundException;
import com.signalvelocity.smsplatform.templates.domain.repository.SmsTemplateRepository;
import com.signalvelocity.smsplatform.users.domain.model.User;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MessageApplicationService {

    private final ContactRepository contactRepository;
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final SmsTemplateRepository smsTemplateRepository;
    private final SmsGateway smsGateway;
    private final CurrentUserProvider currentUserProvider;
    private final CampaignRepository campaignRepository;

    @Transactional
    public MessageResponse sendDirectMessage(SendSmsRequest request) {
        User owner = currentUserProvider.getCurrentUser();
        Contact contact = resolveOrCreateContact(request, owner);
        String content = resolveContent(request);
        Message message = createAndPersistMessage(contact, null, owner, content);
        return MessageResponse.from(message);
    }

    @Transactional
    public List<Message> sendCampaignMessages(Campaign campaign, List<Contact> recipients, String content) {
        List<Message> messages = new ArrayList<>();
        for (Contact contact : recipients) {
            messages.add(createAndPersistMessage(contact, campaign, campaign.getCreatedBy(), content));
        }
        return messages;
    }

    @Transactional
    public MessageResponse handleDeliveryWebhook(String webhookSecret, String expectedSecret, DeliveryWebhookRequest request) {
        if (!expectedSecret.equals(webhookSecret)) {
            throw new BusinessException("Invalid webhook secret");
        }

        Message message = messageRepository.findByProviderMessageId(request.providerMessageId())
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        MessageStatus status = MessageStatus.valueOf(request.status().toUpperCase());
        message.setStatus(status);
        message.setErrorMessage(request.errorMessage());
        if (status == MessageStatus.DELIVERED) {
            message.setDeliveredAt(LocalDateTime.now());
        }

        Message savedMessage = messageRepository.save(message);
        synchronizeCampaignStatus(savedMessage);
        return MessageResponse.from(savedMessage);
    }

    private Contact resolveOrCreateContact(SendSmsRequest request, User owner) {
        if (request.contactId() != null) {
            Contact contact = contactRepository.findById(request.contactId())
                    .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
            if (!contact.getCreatedBy().getId().equals(owner.getId())) {
                throw new BusinessException("Contact does not belong to the authenticated user");
            }
            return contact;
        }

        if (request.phoneNumber() == null || request.phoneNumber().isBlank()) {
            throw new BusinessException("phoneNumber is required when contactId is not provided");
        }

        return contactRepository.save(Contact.builder()
                .firstName(request.firstName() == null || request.firstName().isBlank() ? "Direct" : request.firstName())
                .lastName(request.lastName() == null || request.lastName().isBlank() ? "Recipient" : request.lastName())
                .phoneNumber(request.phoneNumber())
                .status(ContactStatus.ACTIVE)
                .createdBy(owner)
                .build());
    }

    private String resolveContent(SendSmsRequest request) {
        if (request.content() != null && !request.content().isBlank()) {
            return request.content();
        }

        if (request.templateId() != null) {
            var template = smsTemplateRepository.findById(request.templateId())
                    .orElseThrow(() -> new ResourceNotFoundException("Template not found"));
            if (!template.getOwner().getId().equals(currentUserProvider.getCurrentUser().getId())) {
                throw new BusinessException("Template does not belong to the authenticated user");
            }
            return template.getContent();
        }

        throw new BusinessException("Either content or templateId must be provided");
    }

    private Message createAndPersistMessage(Contact contact, Campaign campaign, User owner, String content) {
        Conversation conversation = conversationRepository.findByOwner_IdAndContact_Id(owner.getId(), contact.getId())
                .orElseGet(() -> conversationRepository.save(Conversation.builder()
                        .owner(owner)
                        .contact(contact)
                        .lastMessagePreview(content)
                        .lastMessageAt(LocalDateTime.now())
                        .build()));

        conversation.setLastMessagePreview(content);
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        SmsGatewayResult gatewayResult = smsGateway.send(contact.getPhoneNumber(), content);
        Message message = Message.builder()
                .content(content)
                .recipientPhoneNumber(contact.getPhoneNumber())
                .providerName(gatewayResult.providerName())
                .providerMessageId(gatewayResult.providerMessageId())
                .status(gatewayResult.initialStatus())
                .direction(MessageDirection.OUTBOUND)
                .errorMessage(gatewayResult.errorMessage())
                .contact(contact)
                .campaign(campaign)
                .conversation(conversation)
                .owner(owner)
                .build();

        if (gatewayResult.initialStatus() == MessageStatus.DELIVERED) {
            message.setDeliveredAt(LocalDateTime.now());
        }

        return messageRepository.save(message);
    }

    private void synchronizeCampaignStatus(Message message) {
        Campaign campaign = message.getCampaign();
        if (campaign == null) {
            return;
        }

        long total = messageRepository.countByCampaign_Id(campaign.getId());
        long delivered = messageRepository.countByCampaign_IdAndStatus(campaign.getId(), MessageStatus.DELIVERED);
        long failed = messageRepository.countByCampaign_IdAndStatus(campaign.getId(), MessageStatus.FAILED);
        long pending = total - delivered - failed;

        campaign.setTotalRecipients((int) total);
        campaign.setDeliveredCount((int) delivered);
        campaign.setFailedCount((int) failed);

        if (total == 0) {
            campaign.setStatus(CampaignStatus.DRAFT);
        } else if (failed == total) {
            campaign.setStatus(CampaignStatus.FAILED);
        } else if (pending == 0) {
            campaign.setStatus(CampaignStatus.COMPLETED);
        } else {
            campaign.setStatus(CampaignStatus.PROCESSING);
        }

        campaignRepository.save(campaign);
    }
}
