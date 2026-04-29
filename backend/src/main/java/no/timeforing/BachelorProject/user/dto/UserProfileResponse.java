package no.timeforing.BachelorProject.user.dto;

public record UserProfileResponse(
        Long id,
        String displayName,
        String email,
        String role
) {}