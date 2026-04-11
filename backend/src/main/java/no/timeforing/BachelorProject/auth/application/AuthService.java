package no.timeforing.BachelorProject.auth.application;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import no.timeforing.BachelorProject.auth.dto.LoginResponse;
import no.timeforing.BachelorProject.user.domain.User;
import no.timeforing.BachelorProject.user.repository.UserRepository;

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

    private final Set<String> allowedEmails;
    private final Set<String> adminEmails;

    public AuthService(
            UserRepository userRepository,
            TokenService tokenService,
            PasswordEncoder passwordEncoder,
            @Value("${app.auth.allowed-emails:}") String allowedEmailsCsv,
            @Value("${app.auth.admin-emails:}") String adminEmailsCsv
    ) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;

        this.allowedEmails = parseEmails(allowedEmailsCsv);
        this.adminEmails = parseEmails(adminEmailsCsv);
    }

    @Transactional
    public LoginResponse register(String displayName, String email, String password) {
        String normalizedEmail = normalize(email);

        if (!allowedEmails.contains(normalizedEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This email is not approved for registration"
            );
        }

        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = new User();
        user.setDisplayName(
                (displayName == null || displayName.isBlank())
                        ? deriveDisplayName(normalizedEmail)
                        : displayName.trim()
        );
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(adminEmails.contains(normalizedEmail) ? "ADMIN" : "EMPLOYEE");

        user = userRepository.save(user);

        return createLoginResponse(user);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(String email, String password) {
        String normalizedEmail = normalize(email);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (password == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return createLoginResponse(user);
    }

    // ------------------------
    // Helper methods
    // ------------------------

    private Set<String> parseEmails(String csv) {
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(this::normalize)
                .collect(Collectors.toSet());
    }

    private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private LoginResponse createLoginResponse(User user) {
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

    private String deriveDisplayName(String email) {
        String local = email.split("@")[0]
                .replace(".", " ")
                .replace("_", " ")
                .trim();

        if (local.isBlank()) return "User";

        return Arrays.stream(local.split("\\s+"))
                .filter(p -> !p.isBlank())
                .map(p -> p.substring(0, 1).toUpperCase(Locale.ROOT) + p.substring(1))
                .collect(Collectors.joining(" "));
    }
}