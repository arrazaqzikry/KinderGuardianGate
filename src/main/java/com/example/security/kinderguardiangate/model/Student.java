package com.example.security.kinderguardiangate.model;

import jakarta.persistence.*;
import java.util.Set;

@Entity
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String photoUrl;

    @ManyToMany
    @JoinTable(
            name = "student_guardian",
            joinColumns = @JoinColumn(name = "student_id"),
            inverseJoinColumns = @JoinColumn(name = "guardian_id")
    )
    private Set<Guardian> guardians;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public Set<Guardian> getGuardians() { return guardians; }
    public void setGuardians(Set<Guardian> guardians) { this.guardians = guardians; }
}

