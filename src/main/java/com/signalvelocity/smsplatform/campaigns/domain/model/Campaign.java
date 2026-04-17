package com.signalvelocity.smsplatform.campaigns.domain.model;

import com.signalvelocity.smsplatform.shared.domain.BaseEntity;
import com.signalvelocity.smsplatform.templates.domain.model.SmsTemplate;
import com.signalvelocity.smsplatform.users.domain.model.User;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "campaigns",
        indexes = {
                @Index(name = "idx_campaigns_created_by", columnList = "created_by_id"),
                @Index(name = "idx_campaigns_status_schedule", columnList = "status,scheduleAt")
        }
)
public class Campaign extends BaseEntity {

    @Column(nullable = false, length = 140)
    private String name;

    @Column(nullable = false, length = 1000)
    private String content;

    private LocalDateTime scheduleAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CampaignStatus status;

    @Builder.Default
    @Column(nullable = false)
    private int totalRecipients = 0;

    @Builder.Default
    @Column(nullable = false)
    private int deliveredCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private int failedCount = 0;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "campaign_target_contacts", joinColumns = @JoinColumn(name = "campaign_id"))
    @Column(name = "contact_id", nullable = false)
    private Set<UUID> targetContactIds = new HashSet<>();

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "campaign_target_groups", joinColumns = @JoinColumn(name = "campaign_id"))
    @Column(name = "group_id", nullable = false)
    private Set<UUID> targetGroupIds = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private SmsTemplate template;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;
}
