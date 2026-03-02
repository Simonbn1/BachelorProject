package no.timeforing.BachelorProject.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String displayName;

  @Column(unique = true)
  private String email;

  // Entra ID object id (kan brukes senere)
  private String entraObjectId;

  public User() {}

  public User(String displayName, String email) {
    this.displayName = displayName;
    this.email = email;
  }

  public Long getId() {
    return id;
  }

  public String getDisplayName() {
    return displayName;
  }

  public void setDisplayName(String displayName) {
    this.displayName = displayName;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getEntraObjectId() {
    return entraObjectId;
  }

  public void setEntraObjectId(String entraObjectId) {
    this.entraObjectId = entraObjectId;
  }
}
