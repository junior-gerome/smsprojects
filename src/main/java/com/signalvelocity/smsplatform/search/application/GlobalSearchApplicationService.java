package com.signalvelocity.smsplatform.search.application;

import com.signalvelocity.smsplatform.campaigns.domain.model.Campaign;
import com.signalvelocity.smsplatform.campaigns.domain.repository.CampaignRepository;
import com.signalvelocity.smsplatform.contacts.domain.model.Contact;
import com.signalvelocity.smsplatform.contacts.domain.model.ContactGroup;
import com.signalvelocity.smsplatform.contacts.domain.repository.ContactGroupRepository;
import com.signalvelocity.smsplatform.contacts.domain.repository.ContactRepository;
import com.signalvelocity.smsplatform.messages.domain.model.Conversation;
import com.signalvelocity.smsplatform.messages.domain.repository.ConversationRepository;
import com.signalvelocity.smsplatform.search.interfaces.rest.dto.SearchResultResponse;
import com.signalvelocity.smsplatform.shared.application.CurrentUserProvider;
import com.signalvelocity.smsplatform.templates.domain.model.SmsTemplate;
import com.signalvelocity.smsplatform.templates.domain.repository.SmsTemplateRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GlobalSearchApplicationService {

    private final CurrentUserProvider currentUserProvider;
    private final ContactRepository contactRepository;
    private final ContactGroupRepository contactGroupRepository;
    private final CampaignRepository campaignRepository;
    private final ConversationRepository conversationRepository;
    private final SmsTemplateRepository smsTemplateRepository;

    @Transactional(readOnly = true)
    public List<SearchResultResponse> search(String query, int limit) {
        String normalizedQuery = query == null ? "" : query.trim();
        if (normalizedQuery.length() < 2) {
            return List.of();
        }

        int safeLimit = Math.min(Math.max(limit, 1), 20);
        int perTypeLimit = Math.max(2, Math.min(5, safeLimit));
        var currentUser = currentUserProvider.getCurrentUser();
        var ownerId = currentUser.getId();
        var pageable = PageRequest.of(0, perTypeLimit);

        List<SearchResultResponse> results = new ArrayList<>();
        results.addAll(contactRepository.searchByCreatedBy_Id(ownerId, normalizedQuery, pageable).stream()
                .map(this::mapContact)
                .toList());
        results.addAll(contactGroupRepository.searchByOwner_Id(ownerId, normalizedQuery, pageable).stream()
                .map(this::mapGroup)
                .toList());
        results.addAll(campaignRepository.searchByCreatedBy_Id(ownerId, normalizedQuery, pageable).stream()
                .map(this::mapCampaign)
                .toList());
        results.addAll(conversationRepository.searchByOwner_Id(ownerId, normalizedQuery, pageable).stream()
                .map(this::mapConversation)
                .toList());
        results.addAll(smsTemplateRepository.searchByOwner_Id(ownerId, normalizedQuery, pageable).stream()
                .map(this::mapTemplate)
                .toList());

        return results.stream().limit(safeLimit).toList();
    }

    private SearchResultResponse mapContact(Contact contact) {
        return new SearchResultResponse(
                contact.getId().toString(),
                "contact",
                contact.getFullName(),
                firstNonBlank(contact.getPhoneNumber(), contact.getEmail(), contact.getStatus().name()),
                "/contacts",
                "contacts"
        );
    }

    private SearchResultResponse mapGroup(ContactGroup group) {
        return new SearchResultResponse(
                group.getId().toString(),
                "group",
                group.getName(),
                firstNonBlank(group.getDescription(), group.getContacts().size() + " members"),
                "/contacts",
                "groups"
        );
    }

    private SearchResultResponse mapCampaign(Campaign campaign) {
        return new SearchResultResponse(
                campaign.getId().toString(),
                "campaign",
                campaign.getName(),
                firstNonBlank(campaign.getStatus().name(), campaign.getContent()),
                "/campaigns",
                "campaign"
        );
    }

    private SearchResultResponse mapConversation(Conversation conversation) {
        return new SearchResultResponse(
                conversation.getId().toString(),
                "conversation",
                conversation.getContact().getFullName(),
                firstNonBlank(conversation.getLastMessagePreview(), conversation.getContact().getPhoneNumber()),
                "/chat",
                "chat"
        );
    }

    private SearchResultResponse mapTemplate(SmsTemplate template) {
        return new SearchResultResponse(
                template.getId().toString(),
                "template",
                template.getName(),
                firstNonBlank(template.getDescription(), template.getContent()),
                "/templates",
                "description"
        );
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }
}
