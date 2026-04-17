package com.signalvelocity.smsplatform.automation.domain.repository;

import com.signalvelocity.smsplatform.automation.domain.model.AutomationStatus;
import com.signalvelocity.smsplatform.automation.domain.model.AutomationWorkflow;
import java.util.List;
import java.util.UUID;

public interface AutomationWorkflowRepository {

    AutomationWorkflow save(AutomationWorkflow workflow);

    List<AutomationWorkflow> findAllByOwner_Id(UUID ownerId);

    long count();

    long countByStatus(AutomationStatus status);

    long countByOwner_Id(UUID ownerId);

    long countByOwner_IdAndStatus(UUID ownerId, AutomationStatus status);
}
