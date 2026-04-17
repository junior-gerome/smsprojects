package com.signalvelocity.smsplatform.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.signalvelocity.smsplatform.shared.interfaces.rest.ApiErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, RequestWindow> windows = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    @Value("${app.security.rate-limit.enabled:true}")
    private boolean enabled;

    @Value("${app.security.rate-limit.requests-per-minute:120}")
    private int requestsPerMinute;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (!enabled) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = resolveKey(request);
        long now = System.currentTimeMillis();
        RequestWindow window = windows.compute(key, (ignored, current) -> current == null || current.expiresAt() < now
                ? new RequestWindow(now + 60_000, new AtomicInteger(1))
                : current.incremented());

        if (window.counter().get() > requestsPerMinute) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(response.getWriter(), new ApiErrorResponse(
                    LocalDateTime.now(),
                    HttpStatus.TOO_MANY_REQUESTS.value(),
                    HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase(),
                    "Rate limit exceeded. Please retry in a moment.",
                    Map.of()
            ));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String resolveKey(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getName() != null) {
            return authentication.getName() + ":" + request.getRequestURI();
        }

        String remoteAddress = request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
        return remoteAddress + ":" + request.getRequestURI();
    }

    private record RequestWindow(long expiresAt, AtomicInteger counter) {
        private RequestWindow incremented() {
            counter.incrementAndGet();
            return this;
        }
    }
}
