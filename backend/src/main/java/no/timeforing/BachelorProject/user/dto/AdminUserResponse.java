package no.timeforing.BachelorProject.user.dto;

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

    public Long getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}