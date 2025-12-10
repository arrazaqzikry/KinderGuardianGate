package com.example.security.kinderguardiangate.repository;

import com.example.security.kinderguardiangate.model.ScanLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PickupLogRepository extends JpaRepository<ScanLog, Long> { }
