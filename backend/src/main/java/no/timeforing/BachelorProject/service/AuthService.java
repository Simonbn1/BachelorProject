package no.timeforing.BachelorProject.service;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import no.timeforing.BachelorProject.auth.dto.LoginResponse;
import no.timeforing.BachelorProject.domain.User;
import no.timeforing.BachelorProject.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;

    private final Set<String> adminEmails;

    public AuthService(
            UserRepository userRepository,
            TokenService tokenService,
            PasswordEncoder passwordEncoder,
            @Value("${app.auth.admin-emails:}") String adminEmailsCsv
    ) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;

        this.adminEmails = Arrays.stream(adminEmailsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(s -> s.toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());
    }

    @Transactional
    public LoginResponse register(String displayName, String email, String password) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        String hash = passwordEncoder.encode(password);

        User user = new User();
        user.setDisplayName(displayName);
        user.setEmail(normalizedEmail);
        user.setPasswordHash(hash);
        user.setRole(isAdminEmail(normalizedEmail) ? "ADMIN" : "EMPLOYEE");

        user = userRepository.save(user);

        List<String> roles = List.of(user.getRole());
        TokenService.IssuedToken token = tokenService.issueToken(user, roles);

        LoginResponse res = new LoginResponse();
        res.accessToken = token.token();
        res.expiresInSeconds = token.expiresInSeconds();

        LoginResponse.UserInfo ui = new LoginResponse.UserInfo();
        ui.id = user.getId();
        ui.displayName = user.getDisplayName();
        ui.email = user.getEmail();
        ui.roles = roles;
        res.user = ui;

        return res;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(String email, String password) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (password == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        List<String> roles = List.of(user.getRole());
        TokenService.IssuedToken token = tokenService.issueToken(user, roles);

        LoginResponse res = new LoginResponse();
        res.accessToken = token.token();
        res.expiresInSeconds = token.expiresInSeconds();

        LoginResponse.UserInfo ui = new LoginResponse.UserInfo();
        ui.id = user.getId();
        ui.displayName = user.getDisplayName();
        ui.email = user.getEmail();
        ui.roles = roles;
        res.user = ui;

        return res;
    }

    private boolean isAdminEmail(String email) {
        return adminEmails.contains(email.toLowerCase(Locale.ROOT));
    }

    private String deriveDisplayName(String email) {
        String local = email.split("@")[0].replace(".", " ").replace("_", " ").trim();
        if (local.isBlank()) return "User";
        String[] parts = local.split("\\s+");
        return Arrays.stream(parts)
                .filter(p -> !p.isBlank())
                .map(p -> p.substring(0, 1).toUpperCase(Locale.ROOT) + p.substring(1))
                .collect(Collectors.joining(" "));
    }
}