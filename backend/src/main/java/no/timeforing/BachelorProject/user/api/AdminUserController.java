package no.timeforing.BachelorProject.user.api;

import no.timeforing.BachelorProject.user.domain.User;
import no.timeforing.BachelorProject.user.dto.AdminUserResponse;
import no.timeforing.BachelorProject.user.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(User::getDisplayName, String.CASE_INSENSITIVE_ORDER))
                .map(user -> new AdminUserResponse(
                        user.getId(),
                        user.getDisplayName(),
                        user.getEmail(),
                        user.getRole()
                ))
                .toList();
    }
}