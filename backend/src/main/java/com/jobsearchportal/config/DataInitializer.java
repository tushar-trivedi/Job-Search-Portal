package com.jobsearchportal.config;

import com.jobsearchportal.entity.Admin;
import com.jobsearchportal.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DataInitializer {

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initAdmin(AdminRepository adminRepository) {
        return args -> {
            if (adminRepository.findByEmail("admin@example.com").isEmpty()) {
                Admin admin = new Admin();
                admin.setEmail("admin@example.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.onCreate();
                adminRepository.save(admin);
                System.out.println("Initial admin created with email: admin@example.com");
            } else {
                System.out.println("Admin with email admin@example.com already exists");
            }
        };
    }
}