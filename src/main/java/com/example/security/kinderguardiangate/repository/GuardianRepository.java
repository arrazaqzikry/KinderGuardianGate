package com.example.security.kinderguardiangate.repository;

import com.example.security.kinderguardiangate.model.Guardian;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GuardianRepository extends JpaRepository<Guardian, Long> {
    Optional<Guardian> findByIcNumber(String icNumber);
}
