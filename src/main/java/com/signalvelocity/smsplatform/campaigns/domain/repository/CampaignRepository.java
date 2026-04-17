package com.signalvelocity.smsplatform.campaigns.domain.repository;

import com.signalvelocity.smsplatform.campaigns.domain.model.Campaign;
import com.signalvelocity.smsplatform.campaigns.domain.model.CampaignStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CampaignRepository {

    Campaign save(Campaign campaign);

    Optional<Campaign> findById(UUID id);

    List<Campaign> findAllByCreatedBy_Id(UUID ownerId);

    Page<Campaign> findPageByCreatedBy_Id(UUID ownerId, Pageable pageable);

    List<Campaign> searchByCreatedBy_Id(UUID ownerId, String query, Pageable pageable);

    List<Campaign> findAllByStatusAndScheduleAtBefore(CampaignStatus status, LocalDateTime scheduleAt);

    long count();

    long countByStatus(CampaignStatus status);

    long countByCreatedBy_Id(UUID ownerId);

    long countByCreatedBy_IdAndStatus(UUID ownerId, CampaignStatus status);
}
