package com.example.security.kinderguardiangate.service;

import com.example.security.kinderguardiangate.model.Guardian;
import com.example.security.kinderguardiangate.model.ScanLog;
import com.example.security.kinderguardiangate.model.Student;
import com.example.security.kinderguardiangate.repository.GuardianRepository;
import com.example.security.kinderguardiangate.repository.PickupLogRepository;
import com.example.security.kinderguardiangate.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PickupService {
    private final StudentRepository studentRepo;
    private final GuardianRepository guardianRepo;
    private final PickupLogRepository logRepo;

    public PickupService(StudentRepository studentRepo,
                         GuardianRepository guardianRepo,
                         PickupLogRepository logRepo) {
        this.studentRepo = studentRepo;
        this.guardianRepo = guardianRepo;
        this.logRepo = logRepo;
    }

    public String verifyPickup(Long studentId, String guardianIc) {
        Optional<Student> studentOpt = studentRepo.findById(studentId);
        Optional<Guardian> guardianOpt = guardianRepo.findByIcNumber(guardianIc);

        if (studentOpt.isPresent() && guardianOpt.isPresent()) {
            Student student = studentOpt.get();
            Guardian guardian = guardianOpt.get();

            if (student.getGuardians().contains(guardian)) {
                ScanLog log = new ScanLog();
                log.setStudent(student);
                log.setGuardian(guardian);
                log.setStatus("picked up");
                log.setTimestamp(LocalDateTime.now());
                logRepo.save(log);
                return "AUTHORIZED";
            }
        }
        return "UNAUTHORIZED";
    }
}

