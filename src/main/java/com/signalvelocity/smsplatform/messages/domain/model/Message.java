package com.signalvelocity.smsplatform.messages.domain.model;

import com.signalvelocity.smsplatform.campaigns.domain.model.Campaign;
import com.signalvelocity.smsplatform.contacts.domain.model.Contact;
import com.signalvelocity.smsplatform.shared.domain.BaseEntity;
import com.signalvelocity.smsplatform.users.domain.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
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
        name = "messages",
        indexes = {
                @Index(name = "idx_messages_provider", columnList = "providerMessageId"),
                @Index(name = "idx_messages_campaign_status", columnList = "campaign_id,status"),
                @Index(name = "idx_messages_owner", columnList = "owner_id")
        }
)
public class Message extends BaseEntity {

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(nullable = false, length = 30)
    private String recipientPhoneNumber;

    @Column(length = 120)
    private String providerMessageId;

    @Column(length = 80)
    private String providerName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageDirection direction;

    @Column(length = 300)
    private String errorMessage;

    private LocalDateTime deliveredAt;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id", nullable = false)
    private Contact contact;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
}
