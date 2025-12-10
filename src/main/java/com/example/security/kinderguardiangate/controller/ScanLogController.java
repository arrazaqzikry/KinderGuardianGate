package com.example.security.kinderguardiangate.controller;

import com.example.security.kinderguardiangate.model.ScanLog;
import com.example.security.kinderguardiangate.repository.ScanLogRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/scanlogs")
public class ScanLogController {

    private final ScanLogRepository logRepo;

    public ScanLogController(ScanLogRepository logRepo) {
        this.logRepo = logRepo;
    }

    // Get all scan logs
    @GetMapping
    public List<ScanLog> getAllScanLogs() {
        return logRepo.findAll();
    }

    // Create a new scan log
    @PostMapping
    public ScanLog createScanLog(@RequestBody ScanLog log) {
        log.setTimestamp(LocalDateTime.now());
        return logRepo.save(log);
    }
}
