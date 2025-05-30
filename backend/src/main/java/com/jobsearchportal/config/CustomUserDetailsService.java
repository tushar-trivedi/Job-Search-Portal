package com.jobsearchportal.config;

import com.jobsearchportal.entity.Admin;
import com.jobsearchportal.entity.Candidate;
import com.jobsearchportal.entity.Company;
import com.jobsearchportal.service.AdminService;
import com.jobsearchportal.service.CandidateService;
import com.jobsearchportal.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private CandidateService candidateService;

    @Autowired
    private CompanyService companyService;

    @Autowired
    private AdminService adminService;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Try to find an Admin
        Optional<Admin> adminOpt = adminService.findAdminByEmail(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            return User.withUsername(admin.getEmail())
                    .password(admin.getPassword())
                    .authorities("ROLE_ADMIN")
                    .build();
        }

        // Try to find a Candidate
        Optional<Candidate> candidateOpt = candidateService.findCandidateByEmail(email);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            return User.withUsername(candidate.getEmail())
                    .password(candidate.getPassword())
                    .authorities("ROLE_CANDIDATE")
                    .build();
        }

        // Try to find a Company
        Optional<Company> companyOpt = companyService.findCompanyByEmail(email);
        if (companyOpt.isPresent()) {
            Company company = companyOpt.get();
            return User.withUsername(company.getEmail())
                    .password(company.getPassword())
                    .authorities("ROLE_COMPANY")
                    .build();
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}