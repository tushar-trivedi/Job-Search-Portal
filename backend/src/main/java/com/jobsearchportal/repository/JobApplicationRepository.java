package com.jobsearchportal.repository;

import com.jobsearchportal.entity.JobApplication;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends MongoRepository<JobApplication, String> {
    List<JobApplication> findByCandidateId(String candidateId);
    List<JobApplication> findByJobId(String jobId);
    List<JobApplication> findByStatus(String status);
}