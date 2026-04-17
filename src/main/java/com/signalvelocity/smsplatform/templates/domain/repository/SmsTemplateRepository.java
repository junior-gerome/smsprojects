package com.signalvelocity.smsplatform.templates.domain.repository;

import com.signalvelocity.smsplatform.templates.domain.model.SmsTemplate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

public interface SmsTemplateRepository {

    SmsTemplate save(SmsTemplate template);

    Optional<SmsTemplate> findById(UUID id);

    List<SmsTemplate> findAllByOwner_Id(UUID ownerId);

    List<SmsTemplate> searchByOwner_Id(UUID ownerId, String query, Pageable pageable);
}
