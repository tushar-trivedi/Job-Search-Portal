package com.jobsearchportal.repository;

import com.jobsearchportal.entity.Job;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends MongoRepository<Job, String> {
    List<Job> findByCompanyId(String companyId);
    List<Job> findByLocation(String Location);
    List<Job> findByPositionContainingIgnoreCase(String position);
    List<Job> findByLocationContainingIgnoreCase(String location);
    List<Job> findBySkillsContaining(String skill);
}