package com.jobsearchportal.controller;

import com.jobsearchportal.config.JwtUtil;
import com.jobsearchportal.dto.LoginDTO;
import com.jobsearchportal.service.AdminService;
import com.jobsearchportal.service.CandidateService;
import com.jobsearchportal.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CandidateService candidateService;

    @Autowired
    private CompanyService companyService;

    @Autowired
    private AdminService adminService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginDTO) {
        try {
            // Validate role
            String role = loginDTO.getRole().toLowerCase();
            if (!"candidate".equals(role) && !"company".equals(role) && !"admin".equals(role)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new LoginResponse("Invalid role"));
            }

            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getPassword())
            );

            // Get user details
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Generate JWT
            String jwt = jwtUtil.generateToken(userDetails.getUsername(), role);

            // Prepare response based on role
            if ("admin".equals(role)) {
                return adminService.findAdminByEmail(loginDTO.getEmail())
                        .map(admin -> ResponseEntity.ok(new LoginResponse(jwt, admin, role)))
                        .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new LoginResponse("Invalid credentials")));
            } else if ("candidate".equals(role)) {
                return candidateService.findCandidateByEmail(loginDTO.getEmail())
                        .map(candidate -> ResponseEntity.ok(new LoginResponse(jwt, candidate, role)))
                        .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new LoginResponse("Invalid credentials")));
            } else {
                return companyService.findCompanyByEmail(loginDTO.getEmail())
                        .map(company -> ResponseEntity.ok(new LoginResponse(jwt, company, role)))
                        .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new LoginResponse("Invalid credentials")));
            }
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new LoginResponse("Invalid credentials"));
        }
    }

    // Inner class for login response
    public static class LoginResponse {
        private String token;
        private Object user;
        private String role;
        private String errorMessage;

        public LoginResponse(String token, Object user, String role) {
            this.token = token;
            this.user = user;
            this.role = role;
        }

        public LoginResponse(String errorMessage) {
            this.errorMessage = errorMessage;
        }

        public String getToken() {
            return token;
        }

        public Object getUser() {
            return user;
        }

        public String getRole() {
            return role;
        }

        public String getErrorMessage() {
            return errorMessage;
        }
    }
}