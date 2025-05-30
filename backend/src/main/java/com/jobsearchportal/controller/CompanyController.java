package com.jobsearchportal.controller;

import com.jobsearchportal.dto.CompanyDTO;
import com.jobsearchportal.entity.Company;
import com.jobsearchportal.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @PostMapping
    public ResponseEntity<CompanyDTO> createCompany(@RequestBody CompanyDTO companyDTO) {
        Company company = new Company(
                companyDTO.getName(),
                companyDTO.getEmail(),
                companyDTO.getPassword(),
                companyDTO.getLocation(),
                companyDTO.getDescription()
        );
        Company savedCompany = companyService.createCompany(company);
        CompanyDTO savedDTO = new CompanyDTO(
                savedCompany.getId(),
                savedCompany.getName(),
                savedCompany.getEmail(),
                null, // Exclude password
                savedCompany.getLocation(),
                savedCompany.getDescription(),
                savedCompany.getJobIds()
        );
        return new ResponseEntity<>(savedDTO, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyDTO> updateCompany(@PathVariable String id, @RequestBody CompanyDTO companyDTO) {
        Company company = new Company(
                companyDTO.getName(),
                companyDTO.getEmail(),
                companyDTO.getPassword(),
                companyDTO.getLocation(),
                companyDTO.getDescription()
        );
        Company updatedCompany = companyService.updateCompany(id, company);
        CompanyDTO updatedDTO = new CompanyDTO(
                updatedCompany.getId(),
                updatedCompany.getName(),
                updatedCompany.getEmail(),
                null, // Exclude password
                updatedCompany.getLocation(),
                updatedCompany.getDescription(),
                updatedCompany.getJobIds()
        );
        return new ResponseEntity<>(updatedDTO, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable String id) {
        companyService.deleteCompany(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDTO> getCompanyById(@PathVariable String id) {
        Company company = companyService.findCompanyById(id);
        CompanyDTO companyDTO = new CompanyDTO(
                company.getId(),
                company.getName(),
                company.getEmail(),
                null, // Exclude password
                company.getLocation(),
                company.getDescription(),
                company.getJobIds()
        );
        return new ResponseEntity<>(companyDTO, HttpStatus.OK);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<CompanyDTO> getCompanyByEmail(@PathVariable String email) {
        Company company = companyService.findCompanyByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with email: " + email));
        CompanyDTO companyDTO = new CompanyDTO(
                company.getId(),
                company.getName(),
                company.getEmail(),
                null, // Exclude password
                company.getLocation(),
                company.getDescription(),
                company.getJobIds()
        );
        return new ResponseEntity<>(companyDTO, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<CompanyDTO>> getAllCompanies() {
        List<CompanyDTO> companyDTOs = companyService.findAllCompanies().stream()
                .map(company -> new CompanyDTO(
                        company.getId(),
                        company.getName(),
                        company.getEmail(),
//                        null, // Exclude password
                        company.getPassword(),
                        company.getLocation(),
                        company.getDescription(),
                        company.getJobIds()
                ))
                .collect(Collectors.toList());
        return new ResponseEntity<>(companyDTOs, HttpStatus.OK);
    }
}