package no.timeforing.BachelorProject.user.api;

import no.timeforing.BachelorProject.user.dto.UpdatePasswordRequest;
import no.timeforing.BachelorProject.user.dto.UpdateProfileRequest;
import no.timeforing.BachelorProject.user.dto.UserProfileResponse;
import no.timeforing.BachelorProject.user.service.UserProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
        return userProfileService.getMe(authentication.getName());
    }

    @PatchMapping
    public UserProfileResponse updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request
    ) {
        return userProfileService.updateProfile(authentication.getName(), request);
    }

    @PatchMapping("/password")
    public ResponseEntity<Void> updatePassword(
            Authentication authentication,
            @RequestBody UpdatePasswordRequest request
    ) {
        userProfileService.updatePassword(authentication.getName(), request);
        return ResponseEntity.noContent().build();
    }
}