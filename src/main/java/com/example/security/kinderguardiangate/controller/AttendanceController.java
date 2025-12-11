package com.example.security.kinderguardiangate.controller;

import com.example.security.kinderguardiangate.DTO.AttendanceDTO;
import com.example.security.kinderguardiangate.DTO.StudentAttendanceDTO;
import com.example.security.kinderguardiangate.model.Attendance;
import com.example.security.kinderguardiangate.model.Student;
import com.example.security.kinderguardiangate.repository.AttendanceRepository;
import com.example.security.kinderguardiangate.repository.StudentRepository;
import jakarta.transaction.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceRepository attendanceRepo;
    private final StudentRepository studentRepo;

    public AttendanceController(AttendanceRepository attendanceRepo, StudentRepository studentRepo) {
        this.attendanceRepo = attendanceRepo;
        this.studentRepo = studentRepo;
    }

    @GetMapping("/today")
    public List<StudentAttendanceDTO> getTodayAttendance() {
        LocalDate today = LocalDate.now();
        List<Attendance> recordedAttendance = attendanceRepo.findByAttendanceDate(today);

        List<Student> allStudents = studentRepo.findAll();

        return allStudents.stream()
                .map(student -> {
                    String status = recordedAttendance.stream()
                            .filter(a -> a.getStudent().getId().equals(student.getId()))
                            .findFirst()
                            .map(a -> a.getStatus().name())
                            .orElse(Attendance.AttendanceStatus.ABSENT.name());

                    return new StudentAttendanceDTO(
                            student.getId(),
                            student.getName(),
                            status
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional
    @PostMapping
    public void submitAttendance(@RequestBody List<AttendanceDTO> attendanceList) {
        LocalDate today = LocalDate.now();


        for (AttendanceDTO dto : attendanceList) {
            Student student = studentRepo.findById(dto.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found with ID: " + dto.getStudentId()));

            Attendance attendance = attendanceRepo.findByStudentIdAndAttendanceDate(student.getId(), today)
                    .orElse(new Attendance());

            attendance.setStudent(student);
            attendance.setAttendanceDate(today);
            attendance.setStatus(dto.getStatus());

            attendanceRepo.save(attendance);
        }
        attendanceRepo.flush();
    }
}