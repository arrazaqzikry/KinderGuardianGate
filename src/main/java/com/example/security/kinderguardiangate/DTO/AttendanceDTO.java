package com.example.security.kinderguardiangate.DTO;

import com.example.security.kinderguardiangate.model.Attendance;

public class AttendanceDTO {
    private Long studentId;
    private Attendance.AttendanceStatus status;

    // Getters and Setters
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Attendance.AttendanceStatus getStatus() { return status; }
    public void setStatus(Attendance.AttendanceStatus status) { this.status = status; }
}