package com.thediamond.security;

import com.thediamond.domain.Role;

/** Authenticated user extracted from the JWT. Available via @AuthenticationPrincipal. */
public record AuthPrincipal(Long userId, String email, Role role) {
}
