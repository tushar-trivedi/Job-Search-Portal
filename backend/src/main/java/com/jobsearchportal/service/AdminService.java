package com.jobsearchportal.service;

import com.jobsearchportal.entity.Admin;
import com.jobsearchportal.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private Validator validator;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public Admin createAdmin(Admin admin) {
        // Validate entity
        Set<ConstraintViolation<Admin>> violations = validator.validate(admin);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        // Check for duplicate email
        if (adminRepository.findByEmail(admin.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Hash password
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));

        // Set audit fields
        admin.onCreate();

        return adminRepository.save(admin);
    }

    public Admin updateAdmin(String id, Admin updatedAdmin) {
        // Validate entity
        Set<ConstraintViolation<Admin>> violations = validator.validate(updatedAdmin);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        // Find existing admin
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found with id: " + id));

        // Check for email conflict
        if (!admin.getEmail().equals(updatedAdmin.getEmail()) &&
                adminRepository.findByEmail(updatedAdmin.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Update fields
        admin.setEmail(updatedAdmin.getEmail());
        if (updatedAdmin.getPassword() != null && !updatedAdmin.getPassword().isEmpty()) {
            admin.setPassword(passwordEncoder.encode(updatedAdmin.getPassword()));
        }
        admin.onUpdate();

        return adminRepository.save(admin);
    }

    public void deleteAdmin(String id) {
        if (!adminRepository.existsById(id)) {
            throw new IllegalArgumentException("Admin not found with id: " + id);
        }
        adminRepository.deleteById(id);
    }

    public Admin findAdminById(String id) {
        return adminRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found with id: " + id));
    }

    public Optional<Admin> findAdminByEmail(String email) {
        return adminRepository.findByEmail(email);
    }

    public List<Admin> findAllAdmins() {
        return adminRepository.findAll();
    }
}