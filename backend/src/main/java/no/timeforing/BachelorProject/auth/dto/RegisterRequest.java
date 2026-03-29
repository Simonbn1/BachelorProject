package no.timeforing.BachelorProject.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RegisterRequest {
    @NotBlank public String displayName;
    @NotBlank @Email public String email;
    @NotBlank public String password;
    @NotBlank public String role;
}