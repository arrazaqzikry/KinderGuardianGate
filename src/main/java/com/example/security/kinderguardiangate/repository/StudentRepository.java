package com.example.security.kinderguardiangate.repository;

import com.example.security.kinderguardiangate.model.Attendance;
import com.example.security.kinderguardiangate.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
}
