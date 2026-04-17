package com.signalvelocity.smsplatform.search.interfaces.rest;

import com.signalvelocity.smsplatform.search.application.GlobalSearchApplicationService;
import com.signalvelocity.smsplatform.search.interfaces.rest.dto.SearchResultResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class GlobalSearchController {

    private final GlobalSearchApplicationService globalSearchApplicationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR','ANALYST')")
    public List<SearchResultResponse> search(
            @RequestParam("q") String query,
            @RequestParam(name = "limit", defaultValue = "10") int limit
    ) {
        return globalSearchApplicationService.search(query, limit);
    }
}
