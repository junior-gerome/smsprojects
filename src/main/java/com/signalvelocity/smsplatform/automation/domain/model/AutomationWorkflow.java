package com.signalvelocity.smsplatform.automation.domain.model;

import com.signalvelocity.smsplatform.shared.domain.BaseEntity;
import com.signalvelocity.smsplatform.templates.domain.model.SmsTemplate;
import com.signalvelocity.smsplatform.users.domain.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
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
@Table(name = "automation_workflows")
public class AutomationWorkflow extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 80)
    private String triggerType;

    @Column(nullable = false, length = 80)
    private String actionType;

    @Column(length = 120)
    private String scheduleExpression;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AutomationStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private SmsTemplate template;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
}
