package no.timeforing.BachelorProject.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "app.auth")
public class AuthProperties {

    private List<String> allowedEmails = new ArrayList<>();
    private List<String> adminEmails = new ArrayList<>();

    public List<String> getAllowedEmails() {
        return allowedEmails;
    }

    public void setAllowedEmails(List<String> allowedEmails) {
        this.allowedEmails = allowedEmails;
    }

    public List<String> getAdminEmails() {
        return adminEmails;
    }

    public void setAdminEmails(List<String> adminEmails) {
        this.adminEmails = adminEmails;
    }
}