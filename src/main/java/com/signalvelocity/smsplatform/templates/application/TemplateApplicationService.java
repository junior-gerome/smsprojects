package com.signalvelocity.smsplatform.templates.application;

import com.signalvelocity.smsplatform.shared.application.CurrentUserProvider;
import com.signalvelocity.smsplatform.templates.domain.model.SmsTemplate;
import com.signalvelocity.smsplatform.templates.domain.repository.SmsTemplateRepository;
import com.signalvelocity.smsplatform.templates.interfaces.rest.dto.CreateTemplateRequest;
import com.signalvelocity.smsplatform.templates.interfaces.rest.dto.TemplateResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TemplateApplicationService {

    private final SmsTemplateRepository smsTemplateRepository;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    public TemplateResponse create(CreateTemplateRequest request) {
        SmsTemplate template = smsTemplateRepository.save(SmsTemplate.builder()
                .name(request.name())
                .description(request.description())
                .content(request.content())
                .owner(currentUserProvider.getCurrentUser())
                .build());

        return TemplateResponse.from(template);
    }

    @Transactional(readOnly = true)
    public List<TemplateResponse> findAll() {
        return smsTemplateRepository.findAllByOwner_Id(currentUserProvider.getCurrentUser().getId()).stream()
                .map(TemplateResponse::from)
                .toList();
    }
}
