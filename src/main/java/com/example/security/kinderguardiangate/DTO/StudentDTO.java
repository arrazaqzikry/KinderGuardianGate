package com.example.security.kinderguardiangate.DTO;

import java.util.List;

public class StudentDTO {
    private Long id;
    private String name;
    private String photoUrl;
    private List<String> guardians;

    public StudentDTO(Long id, String name, String photoUrl, List<String> guardians) {
        this.id = id;
        this.name = name;
        this.photoUrl = photoUrl;
        this.guardians = guardians;
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getPhotoUrl() { return photoUrl; }
    public List<String> getGuardians() { return guardians; }
}
