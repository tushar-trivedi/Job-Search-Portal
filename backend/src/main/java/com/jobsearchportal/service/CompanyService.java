package com.jobsearchportal.service;

import com.jobsearchportal.entity.Company;
import com.jobsearchportal.repository.CompanyRepository;
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
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private Validator validator;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public Company createCompany(Company company) {
        // Validate entity
        Set<ConstraintViolation<Company>> violations = validator.validate(company);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        // Check for duplicate email
        if (companyRepository.findByEmail(company.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Hash password
        company.setPassword(passwordEncoder.encode(company.getPassword()));

        // Set audit fields
        company.onCreate();

        return companyRepository.save(company);
    }

    public Company updateCompany(String id, Company updatedCompany) {
        // Validate entity
        Set<ConstraintViolation<Company>> violations = validator.validate(updatedCompany);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        // Find existing company
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + id));

        // Check for email conflict
        if (!company.getEmail().equals(updatedCompany.getEmail()) &&
                companyRepository.findByEmail(updatedCompany.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Update fields
        company.setName(updatedCompany.getName());
        company.setEmail(updatedCompany.getEmail());
        if (updatedCompany.getPassword() != null && !updatedCompany.getPassword().isEmpty()) {
            company.setPassword(passwordEncoder.encode(updatedCompany.getPassword()));
        }
        company.setLocation(updatedCompany.getLocation());
        company.setDescription(updatedCompany.getDescription());
        company.onUpdate();

        return companyRepository.save(company);
    }

    public void deleteCompany(String id) {
        if (!companyRepository.existsById(id)) {
            throw new IllegalArgumentException("Company not found with id: " + id);
        }
        companyRepository.deleteById(id);
    }

    public Company findCompanyById(String id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + id));
    }

    public Optional<Company> findCompanyByEmail(String email) {
        return companyRepository.findByEmail(email);
    }

    public List<Company> findAllCompanies() {
        return companyRepository.findAll();
    }
}