package no.timeforing.BachelorProject.auth.api;

import jakarta.validation.Valid;
import no.timeforing.BachelorProject.auth.dto.LoginRequest;
import no.timeforing.BachelorProject.auth.dto.LoginResponse;
import no.timeforing.BachelorProject.auth.dto.RegisterRequest;
import no.timeforing.BachelorProject.auth.application.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping
    public String ping() {
        return "Auth OK";
    }

    @PostMapping("/register")
    public LoginResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req.displayName, req.email, req.password);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req.email, req.password);
    }
}