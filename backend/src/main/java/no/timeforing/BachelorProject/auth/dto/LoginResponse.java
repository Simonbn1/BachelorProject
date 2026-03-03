package no.timeforing.BachelorProject.auth.dto;

import java.util.List;

public class LoginResponse {
    public String accessToken;
    public long expiresInSeconds;
    public UserInfo user;

    public static class UserInfo {
        public Long id;
        public String displayName;
        public String email;
        public List<String> roles;
    }
}
