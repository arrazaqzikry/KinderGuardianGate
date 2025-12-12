package com.example.security.kinderguardiangate.repository;

import com.example.security.kinderguardiangate.model.ScanLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScanLogRepository extends JpaRepository<ScanLog, Long> {
    // This method is required for your deleteGuardian logic
    List<ScanLog> findByStudentId(Long studentId);
    void deleteByStudentId(Long studentId);  // <-- Add this
    List<ScanLog> findByGuardianId(Long guardianId);
}
