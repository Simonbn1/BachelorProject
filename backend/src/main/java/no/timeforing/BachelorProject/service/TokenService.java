package no.timeforing.BachelorProject.service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import no.timeforing.BachelorProject.domain.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    public record IssuedToken(String token, long expiresInSeconds) {}

    private final JwtEncoder jwtEncoder;
    private final String issuer;
    private final String audience;
    private final Duration accessTtl;

    public TokenService(
            JwtEncoder jwtEncoder,
            @Value("${app.jwt.issuer:mock-auth}") String issuer,
            @Value("${app.jwt.audience:timesheet-app}") String audience,
            @Value("${app.jwt.access-ttl-seconds:3600}") long accessTtlSeconds
    ) {
        this.jwtEncoder = jwtEncoder;
        this.issuer = issuer;
        this.audience = audience;
        this.accessTtl = Duration.ofSeconds(accessTtlSeconds);
    }

    public IssuedToken issueToken(User user, List<String> roles) {
        Instant now = Instant.now();
        Instant exp = now.plus(accessTtl);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(now)
                .expiresAt(exp)
                .subject(String.valueOf(user.getId()))
                .audience(List.of(audience))
                .claim("name", user.getDisplayName())
                .claim("email", user.getEmail())
                .claim("roles", roles)
                .claim("jti", UUID.randomUUID().toString())
                .build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
        return new IssuedToken(token, accessTtl.getSeconds());
    }
}
