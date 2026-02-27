package no.timeforing.BachelorProject.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "projects")
public class Project {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String name;

    // valgfritt: kunde/avdeling/land etc.
    private String customer;

    public Project() {}

    public Project(String name) { this.name = name; }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCustomer() { return customer; }
    public void setCustomer(String customer) { this.customer = customer; }
}