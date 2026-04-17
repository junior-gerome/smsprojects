package com.signalvelocity.smsplatform.campaigns.application;

import com.signalvelocity.smsplatform.campaigns.domain.model.Campaign;
import com.signalvelocity.smsplatform.campaigns.domain.model.CampaignStatus;
import com.signalvelocity.smsplatform.campaigns.domain.repository.CampaignRepository;
import com.signalvelocity.smsplatform.campaigns.interfaces.rest.dto.CampaignResponse;
import com.signalvelocity.smsplatform.campaigns.interfaces.rest.dto.CreateCampaignRequest;
import com.signalvelocity.smsplatform.contacts.domain.model.Contact;
import com.signalvelocity.smsplatform.contacts.domain.model.ContactGroup;
import com.signalvelocity.smsplatform.contacts.domain.repository.ContactGroupRepository;
import com.signalvelocity.smsplatform.contacts.domain.repository.ContactRepository;
import com.signalvelocity.smsplatform.messages.application.MessageApplicationService;
import com.signalvelocity.smsplatform.messages.domain.model.Message;
import com.signalvelocity.smsplatform.messages.domain.model.MessageStatus;
import com.signalvelocity.smsplatform.shared.application.CurrentUserProvider;
import com.signalvelocity.smsplatform.shared.application.exception.BusinessException;
import com.signalvelocity.smsplatform.shared.application.exception.ResourceNotFoundException;
import com.signalvelocity.smsplatform.shared.interfaces.rest.PageResponse;
import com.signalvelocity.smsplatform.templates.domain.model.SmsTemplate;
import com.signalvelocity.smsplatform.templates.domain.repository.SmsTemplateRepository;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CampaignApplicationService {

    private final CampaignRepository campaignRepository;
    private final ContactRepository contactRepository;
    private final ContactGroupRepository contactGroupRepository;
    private final SmsTemplateRepository smsTemplateRepository;
    private final MessageApplicationService messageApplicationService;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    public CampaignResponse create(CreateCampaignRequest request) {
        var currentUser = currentUserProvider.getCurrentUser();
        SmsTemplate template = request.templateId() == null
                ? null
                : smsTemplateRepository.findById(request.templateId())
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        if (template != null && !template.getOwner().getId().equals(currentUser.getId())) {
            throw new BusinessException("Template does not belong to the authenticated user");
        }

        String content = request.content() != null && !request.content().isBlank()
                ? request.content()
                : template != null ? template.getContent() : null;

        if (content == null || content.isBlank()) {
            throw new BusinessException("Campaign content is required");
        }

        Campaign campaign = campaignRepository.save(Campaign.builder()
                .name(request.name())
                .content(content)
                .scheduleAt(request.scheduleAt())
                .status(request.sendNow() || request.scheduleAt() == null ? CampaignStatus.PROCESSING : CampaignStatus.SCHEDULED)
                .targetContactIds(new HashSet<>(request.targetContactIds()))
                .targetGroupIds(new HashSet<>(request.targetGroupIds()))
                .template(template)
                .createdBy(currentUser)
                .build());

        if (campaign.getStatus() == CampaignStatus.PROCESSING) {
            dispatchCampaign(campaign);
        }

        return CampaignResponse.from(campaignRepository.save(campaign));
    }

    @Transactional(readOnly = true)
    public PageResponse<CampaignResponse> findAll(Pageable pageable) {
        return PageResponse.from(
                campaignRepository.findPageByCreatedBy_Id(currentUserProvider.getCurrentUser().getId(), pageable),
                CampaignResponse::from
        );
    }

    @Transactional
    public void dispatchDueScheduledCampaigns() {
        campaignRepository.findAllByStatusAndScheduleAtBefore(CampaignStatus.SCHEDULED, LocalDateTime.now())
                .forEach(this::dispatchCampaign);
    }

    private void dispatchCampaign(Campaign campaign) {
        Set<Contact> recipients = resolveRecipients(campaign);
        List<Message> messages = messageApplicationService.sendCampaignMessages(campaign, List.copyOf(recipients), campaign.getContent());

        long failed = messages.stream().filter(message -> message.getStatus() == MessageStatus.FAILED).count();

        campaign.setTotalRecipients(messages.size());
        campaign.setDeliveredCount(0);
        campaign.setFailedCount((int) failed);
        campaign.setStatus(failed == messages.size() && !messages.isEmpty() ? CampaignStatus.FAILED : CampaignStatus.PROCESSING);
        campaignRepository.save(campaign);
    }

    private Set<Contact> resolveRecipients(Campaign campaign) {
        Set<Contact> recipients = contactRepository.findAllByIdInAndCreatedBy_Id(
                        campaign.getTargetContactIds(),
                        campaign.getCreatedBy().getId()
                ).stream()
                .collect(java.util.stream.Collectors.toCollection(HashSet::new));

        if (recipients.size() != campaign.getTargetContactIds().size()) {
            throw new BusinessException("One or more target contacts were not found for the authenticated user");
        }

        List<ContactGroup> groups = contactGroupRepository.findAllByIdInAndOwner_Id(campaign.getTargetGroupIds(), campaign.getCreatedBy().getId());
        if (groups.size() != campaign.getTargetGroupIds().size()) {
            throw new BusinessException("One or more target groups were not found for the authenticated user");
        }
        groups.forEach(group -> recipients.addAll(group.getContacts()));

        if (recipients.isEmpty()) {
            throw new BusinessException("Campaign requires at least one target contact or group");
        }

        return recipients;
    }
}
