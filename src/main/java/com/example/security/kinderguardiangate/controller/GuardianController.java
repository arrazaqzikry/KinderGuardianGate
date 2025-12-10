package com.example.security.kinderguardiangate.controller;

import com.example.security.kinderguardiangate.model.Guardian;
import com.example.security.kinderguardiangate.model.ScanLog;
import com.example.security.kinderguardiangate.model.Student;
import com.example.security.kinderguardiangate.repository.GuardianRepository;
import com.example.security.kinderguardiangate.repository.StudentRepository;
import com.example.security.kinderguardiangate.repository.ScanLogRepository;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/guardians")
public class GuardianController {

    @Autowired
    private GuardianRepository guardianRepo;

    @Autowired
    private StudentRepository studentRepo;

    @Autowired
    private ScanLogRepository scanLogRepo;

    // Get all guardians with their assigned children names
    @GetMapping
    public List<Map<String, Object>> getAllGuardians() {
        return guardianRepo.findAll().stream().map(g -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", g.getId());
            map.put("name", g.getName());
            map.put("icNumber", g.getIcNumber());
            map.put("photoUrl", g.getPhotoUrl());
            map.put("students", g.getStudents() != null ?
                    g.getStudents().stream().map(Student::getName).collect(Collectors.toList())
                    : List.of());
            return map;
        }).collect(Collectors.toList());
    }

    // Add a guardian
    @PostMapping
    public Guardian addGuardian(@RequestBody Guardian guardian) {
        return guardianRepo.save(guardian);
    }

    // Assign children to guardian
    @Transactional
    @PutMapping("/{guardianId}/students")
    public Guardian assignStudents(@PathVariable Long guardianId, @RequestBody Map<String, List<Long>> payload) {
        Guardian guardian = guardianRepo.findById(guardianId)
                .orElseThrow(() -> new RuntimeException("Guardian not found"));

        List<Long> studentIds = payload.get("studentIds");

        // Remove guardian from all students first
        if (guardian.getStudents() != null) {
            guardian.getStudents().forEach(s -> s.getGuardians().remove(guardian));
            guardian.getStudents().clear();
        }

        // Assign guardian to selected students
        Set<Student> selectedStudents = studentIds.stream()
                .map(id -> studentRepo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Student not found")))
                .collect(Collectors.toSet());

        selectedStudents.forEach(s -> s.getGuardians().add(guardian));
        guardian.setStudents(selectedStudents);

        studentRepo.saveAll(selectedStudents);
        return guardianRepo.save(guardian);
    }

    // Delete guardian safely
    @Transactional
    @DeleteMapping("/{id}")
    public void deleteGuardian(@PathVariable Long id) {
        Guardian guardian = guardianRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Guardian not found"));

        // 1️⃣ Detach guardian from all students
        guardian.getStudents().forEach(s -> s.getGuardians().remove(guardian));
        guardian.getStudents().clear();

        // 2️⃣ Detach guardian from all scan logs
        scanLogRepo.findByGuardianId(guardian.getId())
                .forEach(sl -> sl.setGuardian(null));
        scanLogRepo.flush(); // persist changes

        // 3️⃣ Now delete the guardian safely
        guardianRepo.delete(guardian);
    }

    @PostMapping("/verify")
    public Map<String,Object> verifyParent(@RequestParam String icNumber) {
        Map<String,Object> response = new HashMap<>();

        Optional<Guardian> guardianOpt = guardianRepo.findAll().stream()
                .filter(g -> g.getIcNumber().equalsIgnoreCase(icNumber))
                .findFirst();

        // Create a new scan log
        ScanLog log = new ScanLog();
        log.setTimestamp(LocalDateTime.now());

        if (guardianOpt.isPresent()) {
            Guardian guardian = guardianOpt.get();
            List<String> children = guardian.getStudents().stream()
                    .map(Student::getName)
                    .toList();

            response.put("status", "success");
            response.put("guardianName", guardian.getName());
            response.put("children", children);

            log.setGuardian(guardian);
            log.setStatus("AUTHORIZED");

            // Correctly get the first child
            if (!guardian.getStudents().isEmpty()) {
                Student firstChild = guardian.getStudents().iterator().next();
                log.setStudent(firstChild);
            }

        } else {
            // Unauthorized scan
            response.put("status", "failure");
            response.put("guardianName", icNumber);
            response.put("children", List.of());

            log.setStatus("UNAUTHORIZED");
        }

        // Save log to H2 database
        scanLogRepo.save(log);

        return response;
    }




}
