package no.timeforing.BachelorProject.user.repository;

import java.util.Optional;
import no.timeforing.BachelorProject.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);
}
