package com.signalvelocity.smsplatform.templates.infrastructure.persistence;

import com.signalvelocity.smsplatform.templates.domain.model.SmsTemplate;
import com.signalvelocity.smsplatform.templates.domain.repository.SmsTemplateRepository;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SpringDataSmsTemplateRepository extends JpaRepository<SmsTemplate, UUID>, SmsTemplateRepository {
    @Override
    @Query("""
            select template from SmsTemplate template
            where template.owner.id = :ownerId
              and (
                lower(template.name) like lower(concat('%', :query, '%'))
                or lower(coalesce(template.description, '')) like lower(concat('%', :query, '%'))
                or lower(template.content) like lower(concat('%', :query, '%'))
              )
            order by template.createdAt desc
            """)
    java.util.List<SmsTemplate> searchByOwner_Id(@Param("ownerId") UUID ownerId, @Param("query") String query, Pageable pageable);
}
