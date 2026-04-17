package com.signalvelocity.smsplatform.analytics.application;

import com.signalvelocity.smsplatform.analytics.domain.model.AnalyticsSnapshot;
import com.signalvelocity.smsplatform.analytics.interfaces.rest.dto.AnalyticsResponse;
import com.signalvelocity.smsplatform.automation.domain.model.AutomationStatus;
import com.signalvelocity.smsplatform.automation.domain.repository.AutomationWorkflowRepository;
import com.signalvelocity.smsplatform.campaigns.domain.model.CampaignStatus;
import com.signalvelocity.smsplatform.campaigns.domain.repository.CampaignRepository;
import com.signalvelocity.smsplatform.contacts.domain.repository.ContactGroupRepository;
import com.signalvelocity.smsplatform.contacts.domain.repository.ContactRepository;
import com.signalvelocity.smsplatform.messages.domain.model.MessageStatus;
import com.signalvelocity.smsplatform.messages.domain.repository.MessageRepository;
import com.signalvelocity.smsplatform.shared.application.CurrentUserProvider;
import com.signalvelocity.smsplatform.users.domain.model.RoleName;
import com.signalvelocity.smsplatform.users.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnalyticsApplicationService {

    private final UserRepository userRepository;
    private final ContactRepository contactRepository;
    private final ContactGroupRepository contactGroupRepository;
    private final CampaignRepository campaignRepository;
    private final MessageRepository messageRepository;
    private final AutomationWorkflowRepository automationWorkflowRepository;
    private final CurrentUserProvider currentUserProvider;

    public AnalyticsResponse getOverview() {
        var currentUser = currentUserProvider.getCurrentUser();
        boolean globalScope = currentUser.getRoles().stream()
                .anyMatch(role -> role.getName() == RoleName.ROLE_ADMIN);

        long totalUsers = globalScope ? userRepository.count() : 1;
        long totalContacts = globalScope
                ? contactRepository.count()
                : contactRepository.countByCreatedBy_Id(currentUser.getId());
        long totalGroups = globalScope
                ? contactGroupRepository.count()
                : contactGroupRepository.countByOwner_Id(currentUser.getId());
        long totalCampaigns = globalScope
                ? campaignRepository.count()
                : campaignRepository.countByCreatedBy_Id(currentUser.getId());
        long scheduledCampaigns = globalScope
                ? campaignRepository.countByStatus(CampaignStatus.SCHEDULED)
                : campaignRepository.countByCreatedBy_IdAndStatus(currentUser.getId(), CampaignStatus.SCHEDULED);
        long totalMessages = globalScope
                ? messageRepository.count()
                : messageRepository.countByOwner_Id(currentUser.getId());
        long delivered = globalScope
                ? messageRepository.countByStatus(MessageStatus.DELIVERED)
                : messageRepository.countByOwner_IdAndStatus(currentUser.getId(), MessageStatus.DELIVERED);
        long failed = globalScope
                ? messageRepository.countByStatus(MessageStatus.FAILED)
                : messageRepository.countByOwner_IdAndStatus(currentUser.getId(), MessageStatus.FAILED);
        long activeAutomations = globalScope
                ? automationWorkflowRepository.countByStatus(AutomationStatus.ACTIVE)
                : automationWorkflowRepository.countByOwner_IdAndStatus(currentUser.getId(), AutomationStatus.ACTIVE);
        double deliveryRate = totalMessages == 0 ? 0 : (double) delivered / totalMessages * 100;

        AnalyticsSnapshot snapshot = new AnalyticsSnapshot(
                totalUsers,
                totalContacts,
                totalGroups,
                totalCampaigns,
                scheduledCampaigns,
                totalMessages,
                delivered,
                failed,
                activeAutomations,
                deliveryRate
        );

        return AnalyticsResponse.from(snapshot);
    }
}
