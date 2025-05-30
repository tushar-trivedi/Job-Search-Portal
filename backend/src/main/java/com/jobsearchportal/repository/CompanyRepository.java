package com.jobsearchportal.repository;

import com.jobsearchportal.entity.Company;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends MongoRepository<Company, String> {
    Optional<Company> findByEmail(String email);
    Optional<Company> findByName(String name);
}