package com.jobsearchportal.controller;

import com.jobsearchportal.dto.AdminDTO;
import com.jobsearchportal.entity.Admin;
import com.jobsearchportal.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admins")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<AdminDTO> createAdmin(@RequestBody AdminDTO adminDTO) {
        Admin admin = new Admin(
                adminDTO.getEmail(),
                adminDTO.getPassword()
        );
        Admin savedAdmin = adminService.createAdmin(admin);
        AdminDTO savedDTO = new AdminDTO(
                savedAdmin.getId(),
                savedAdmin.getEmail(),
                null // Exclude password
        );
        return new ResponseEntity<>(savedDTO, HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<AdminDTO> updateAdmin(@PathVariable String id, @RequestBody AdminDTO adminDTO) {
        Admin admin = new Admin(
                adminDTO.getEmail(),
                adminDTO.getPassword()
        );
        Admin updatedAdmin = adminService.updateAdmin(id, admin);
        AdminDTO updatedDTO = new AdminDTO(
                updatedAdmin.getId(),
                updatedAdmin.getEmail(),
                null // Exclude password
        );
        return new ResponseEntity<>(updatedDTO, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable String id) {
        adminService.deleteAdmin(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<AdminDTO> getAdminById(@PathVariable String id) {
        Admin admin = adminService.findAdminById(id);
        AdminDTO adminDTO = new AdminDTO(
                admin.getId(),
                admin.getEmail(),
                null // Exclude password
        );
        return new ResponseEntity<>(adminDTO, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/email/{email}")
    public ResponseEntity<AdminDTO> getAdminByEmail(@PathVariable String email) {
        Admin admin = adminService.findAdminByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found with email: " + email));
        AdminDTO adminDTO = new AdminDTO(
                admin.getId(),
                admin.getEmail(),
                null // Exclude password
        );
        return new ResponseEntity<>(adminDTO, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<AdminDTO>> getAllAdmins() {
        List<AdminDTO> adminDTOs = adminService.findAllAdmins().stream()
                .map(admin -> new AdminDTO(
                        admin.getId(),
                        admin.getEmail(),
                        null // Exclude password
                ))
                .collect(Collectors.toList());
        return new ResponseEntity<>(adminDTOs, HttpStatus.OK);
    }
}