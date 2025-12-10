package com.example.security.kinderguardiangate.dto;

import java.time.LocalDateTime;

public class PickupDTO {
    private String guardianName;
    private String studentName;
    private LocalDateTime timestamp;
    private String status;

    public PickupDTO(String guardianName, String studentName, LocalDateTime timestamp, String status) {
        this.guardianName = guardianName;
        this.studentName = studentName;
        this.timestamp = timestamp;
        this.status = status;
    }

    // getters and setters
    public String getGuardianName() { return guardianName; }
    public String getStudentName() { return studentName; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getStatus() { return status; }
}
