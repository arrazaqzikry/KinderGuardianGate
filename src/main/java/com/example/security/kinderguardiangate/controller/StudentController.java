package com.example.security.kinderguardiangate.controller;

import com.example.security.kinderguardiangate.DTO.StudentDTO;
import com.example.security.kinderguardiangate.model.Student;
import com.example.security.kinderguardiangate.repository.StudentRepository;
import com.example.security.kinderguardiangate.repository.ScanLogRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentRepository studentRepo;

    @Autowired
    private ScanLogRepository scanLogRepo; // in case scan logs reference students

    @GetMapping
    public List<StudentDTO> getAllStudents() {
        return studentRepo.findAll().stream()
                .map(s -> new StudentDTO(
                        s.getId(),
                        s.getName(),
                        s.getPhotoUrl(),
                        s.getGuardians().stream()
                                .map(g -> g.getName())
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
    }

    @PostMapping
    public Student addStudent(@RequestBody Student student) {
        return studentRepo.save(student);
    }

    // Safe delete method
    @Transactional
    @DeleteMapping("/{id}")
    public void deleteStudent(@PathVariable Long id) {
        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id " + id));

        // 1️⃣ Detach from all guardians
        if (student.getGuardians() != null) {
            student.getGuardians().forEach(g -> g.getStudents().remove(student));
            student.getGuardians().clear();
        }

        // 2️⃣ Detach from all scan logs (if scan logs reference student)
        scanLogRepo.findByStudentId(student.getId())
                .forEach(sl -> sl.setStudent(null));
        scanLogRepo.flush();

        // 3️⃣ Delete student
        studentRepo.delete(student);
    }
}
