package no.timeforing.BachelorProject.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminUserResponse {

    private Long id;
    private String displayName;
    private String email;
    private String role;

    public AdminUserResponse(Long id, String displayName, String email, String role) {
        this.id = id;
        this.displayName = displayName;
        this.email = email;
        this.role = role;
    }

}