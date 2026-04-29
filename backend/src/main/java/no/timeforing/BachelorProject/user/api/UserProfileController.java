package no.timeforing.BachelorProject.user.api;

import no.timeforing.BachelorProject.user.dto.UpdatePasswordRequest;
import no.timeforing.BachelorProject.user.dto.UpdateProfileRequest;
import no.timeforing.BachelorProject.user.dto.UserProfileResponse;
import no.timeforing.BachelorProject.user.service.UserProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping
    public UserProfileResponse getMe(Authentication authentication) {
        return userProfileService.getMe(getEmail(authentication));
    }

    @PatchMapping
    public UserProfileResponse updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request
    ) {
        return userProfileService.updateProfile(getEmail(authentication), request);
    }

    @PatchMapping("/password")
    public ResponseEntity<Void> updatePassword(
            Authentication authentication,
            @RequestBody UpdatePasswordRequest request
    ) {
        userProfileService.updatePassword(getEmail(authentication), request);
        return ResponseEntity.noContent().build();
    }

    private String getEmail(Authentication authentication) {
        if (authentication.getPrincipal() instanceof Jwt jwt) {
            String email = jwt.getClaimAsString("email");

            if (email == null || email.isBlank()) {
                email = jwt.getClaimAsString("preferred_username");
            }

            if (email == null || email.isBlank()) {
                email = jwt.getSubject();
            }

            System.out.println("PROFILE EMAIL FROM JWT: " + email);
            return email;
        }

        System.out.println("PROFILE AUTH NAME: " + authentication.getName());
        return authentication.getName();
    }
}