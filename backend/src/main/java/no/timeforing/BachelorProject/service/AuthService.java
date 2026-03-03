package no.timeforing.BachelorProject.service;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import no.timeforing.BachelorProject.auth.dto.LoginResponse;
import no.timeforing.BachelorProject.domain.User;
import no.timeforing.BachelorProject.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TokenService tokenService;

    private final Set<String> adminEmails;

    public AuthService(
            UserRepository userRepository,
            TokenService tokenService,
            @Value("${app.auth.admin-emails:}") String adminEmailsCsv
    ) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.adminEmails = Arrays.stream(adminEmailsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(s -> s.toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());
    }

    @Transactional
    public LoginResponse login(String email, String passwordIgnoredForMock) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(normalizedEmail).orElseGet(() -> {
            String displayName = deriveDisplayName(normalizedEmail);
            User created = new User(displayName, normalizedEmail);
            return userRepository.save(created);
        });

        List<String> roles = isAdminEmail(normalizedEmail) ? List.of("EMPLOYEE", "ADMIN") : List.of("EMPLOYEE");

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
        return adminEmails.contains(email);
    }

    private String deriveDisplayName(String email) {
        String local = email.split("@")[0].replace(".", " ").replace("_", " ").trim();
        if (local.isBlank()) return "User";
        String[] parts = local.split("\\s+");
        return Arrays.stream(parts)
                .filter(p -> !p.isBlank())
                .map(p -> p.substring(0,1).toUpperCase(Locale.ROOT) + p.substring(1))
                .collect(Collectors.joining(" "));
    }
}
