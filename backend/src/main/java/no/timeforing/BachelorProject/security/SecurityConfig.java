package no.timeforing.BachelorProject.security;

import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.issuer:mock-auth}")
    private String issuer;

    // 1) AUTH endpoints: helt åpne, ingen resource server her
    @Bean
    @Order(1)
    public SecurityFilterChain authChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/api/auth/**")
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/auth/**").permitAll()
                        .anyRequest().permitAll()
                );

        return http.build();
    }

    // 2) Resten av API: beskyttet med JWT
    @Bean
    @Order(2)
    public SecurityFilterChain apiChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/health", "/").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/actuator/health/**").permitAll()
                        .requestMatchers("/api/approvals/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .headers(h -> h.frameOptions(f -> f.sameOrigin()))
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter())));

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKey key = secretKey();
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();

        OAuth2TokenValidator<Jwt> withTimestamp = new JwtTimestampValidator();
        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuer);
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(withTimestamp, withIssuer));
        return decoder;
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(secretKey()));
    }

    private SecretKey secretKey() {
        byte[] bytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("app.jwt.secret must be at least 32 characters (256-bit) for HS256");
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    private JwtAuthenticationConverter jwtAuthConverter() {
        JwtGrantedAuthoritiesConverter defaultScopes = new JwtGrantedAuthoritiesConverter();
        defaultScopes.setAuthorityPrefix("SCOPE_");
        defaultScopes.setAuthoritiesClaimName("scope");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Collection<GrantedAuthority> authorities = defaultScopes.convert(jwt);

            Object rolesClaim = jwt.getClaims().get("roles");
            if (rolesClaim instanceof Collection<?> roles) {
                List<GrantedAuthority> roleAuthorities = roles.stream()
                        .map(Object::toString)
                        .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
                authorities.addAll(roleAuthorities);
            }
            return authorities;
        });
        return converter;
    }
}