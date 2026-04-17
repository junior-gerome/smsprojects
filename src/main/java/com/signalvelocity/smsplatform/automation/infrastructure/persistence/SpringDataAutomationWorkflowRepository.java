package com.signalvelocity.smsplatform.automation.infrastructure.persistence;

import com.signalvelocity.smsplatform.automation.domain.model.AutomationWorkflow;
import com.signalvelocity.smsplatform.automation.domain.repository.AutomationWorkflowRepository;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataAutomationWorkflowRepository extends JpaRepository<AutomationWorkflow, UUID>, AutomationWorkflowRepository {
    @Override
    long countByOwner_Id(UUID ownerId);

    @Override
    long countByOwner_IdAndStatus(UUID ownerId, com.signalvelocity.smsplatform.automation.domain.model.AutomationStatus status);
}
