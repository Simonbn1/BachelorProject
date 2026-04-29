package no.timeforing.BachelorProject.user.dto;

public record UpdatePasswordRequest(
        String currentPassword,
        String newPassword
) {}