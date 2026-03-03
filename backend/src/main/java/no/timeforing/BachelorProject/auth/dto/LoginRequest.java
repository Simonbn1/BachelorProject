package no.timeforing.BachelorProject.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank @Email
    public String email;

    // Optional in mock; keep for realistic UI
    public String password;
}
