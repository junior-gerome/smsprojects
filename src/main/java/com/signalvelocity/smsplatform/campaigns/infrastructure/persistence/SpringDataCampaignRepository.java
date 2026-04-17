package com.signalvelocity.smsplatform.campaigns.infrastructure.persistence;

import com.signalvelocity.smsplatform.campaigns.domain.model.Campaign;
import com.signalvelocity.smsplatform.campaigns.domain.repository.CampaignRepository;
import java.util.UUID;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SpringDataCampaignRepository extends JpaRepository<Campaign, UUID>, CampaignRepository {
    @Override
    Page<Campaign> findPageByCreatedBy_Id(UUID ownerId, Pageable pageable);

    @Override
    @Query("""
            select campaign from Campaign campaign
            where campaign.createdBy.id = :ownerId
              and (
                lower(campaign.name) like lower(concat('%', :query, '%'))
                or lower(campaign.content) like lower(concat('%', :query, '%'))
              )
            order by campaign.createdAt desc
            """)
    java.util.List<Campaign> searchByCreatedBy_Id(@Param("ownerId") UUID ownerId, @Param("query") String query, Pageable pageable);

    @Override
    long countByCreatedBy_Id(UUID ownerId);

    @Override
    long countByCreatedBy_IdAndStatus(UUID ownerId, com.signalvelocity.smsplatform.campaigns.domain.model.CampaignStatus status);
}
