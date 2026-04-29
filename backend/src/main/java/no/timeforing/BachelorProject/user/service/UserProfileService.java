package no.timeforing.BachelorProject.user.service;

import no.timeforing.BachelorProject.user.domain.User;
import no.timeforing.BachelorProject.user.dto.UpdatePasswordRequest;
import no.timeforing.BachelorProject.user.dto.UpdateProfileRequest;
import no.timeforing.BachelorProject.user.dto.UserProfileResponse;
import no.timeforing.BachelorProject.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getMe(String email) {
        User user = findUserByEmail(email);
        return toResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findUserByEmail(email);

        if (request.displayName() == null || request.displayName().isBlank()) {
            throw new IllegalArgumentException("Navn kan ikke være tomt.");
        }

        user.setDisplayName(request.displayName().trim());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void updatePassword(String email, UpdatePasswordRequest request) {
        User user = findUserByEmail(email);

        if (request.currentPassword() == null || request.currentPassword().isBlank()) {
            throw new IllegalArgumentException("Nåværende passord må fylles ut.");
        }

        if (request.newPassword() == null || request.newPassword().length() < 8) {
            throw new IllegalArgumentException("Nytt passord må være minst 8 tegn.");
        }

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Nåværende passord er feil.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Fant ikke bruker."));
    }

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getDisplayName(),
                user.getEmail(),
                user.getRole()
        );
    }
}