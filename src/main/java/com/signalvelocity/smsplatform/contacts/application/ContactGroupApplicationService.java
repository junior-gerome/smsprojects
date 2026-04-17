package com.signalvelocity.smsplatform.contacts.application;

import com.signalvelocity.smsplatform.contacts.domain.model.ContactGroup;
import com.signalvelocity.smsplatform.contacts.domain.repository.ContactGroupRepository;
import com.signalvelocity.smsplatform.contacts.interfaces.rest.dto.CreateGroupRequest;
import com.signalvelocity.smsplatform.contacts.interfaces.rest.dto.GroupResponse;
import com.signalvelocity.smsplatform.shared.application.CurrentUserProvider;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContactGroupApplicationService {

    private final ContactGroupRepository contactGroupRepository;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    public GroupResponse createGroup(CreateGroupRequest request) {
        ContactGroup group = contactGroupRepository.save(ContactGroup.builder()
                .name(request.name())
                .description(request.description())
                .owner(currentUserProvider.getCurrentUser())
                .build());

        return GroupResponse.from(group);
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> findAll() {
        return contactGroupRepository.findAllByOwner_Id(currentUserProvider.getCurrentUser().getId()).stream()
                .map(GroupResponse::from)
                .toList();
    }
}
